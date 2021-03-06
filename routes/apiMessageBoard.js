/*
* Norton 2021 - CourseApp
*
*/

// const replySchema = mongoose.Schema({
//     text: { type: String, required: true },
//     created_on: Date,
//     author: { type: String, required: true },
//     reported: { type: Boolean, default: false }
//   })

// const threadSchema = mongoose.Schema({
//     courseId: { type: String, required: true }, 
//     text: { type: String, required: true },
//     created_on: Date,
//     bumped_on: Date,
//     status: String,
//     author: { type: String, required: true },
//     reported: { type: Boolean, default: false },
//     replies: {type: [replySchema], default: []}
//   })

module.exports = function(app,db) {

  // ensureAuthenticated
  const ensureAuthenticated = (req,res,next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
  };

  // ensureAdminOrTeacher
  const ensureAdminOrTeacher = (req, res, next) => {
    if (req.user.roles.includes('admin')) {
        next();
    } else {
        if (req.user.roles.includes('teacher')) {
            let courseId = req.params.courseId;
            
            db.models.Course.findOne()
                .and([{ _id: courseId }, { 'instructors.instructorId': req.user.id }])
                .exec((err, course) => {
                    if (course) {
                      req.user.currentTeacher = true;
                      next();
                    }
                })
        } else {
            res.redirect('/main');
        }
    }
  };

  // checkIfTeacher
  const setCurrentTeacher = (req, res, next) => {
      if (req.user.roles.includes('teacher')) {
          let courseId = req.params.courseId;
          
          db.models.Course.findOne()
              .and([{ _id: courseId }, { 'instructors.instructorId': req.user.id }])
              .exec((err, course) => {
                  if (course) {
                    req.user.currentTeacher = true;
                    next();
                  } else {
                    next();
                  }
              })
      } else {
          next();
      }
  };

  app.route('/course/messageBoard/:courseId')

  .get(ensureAuthenticated, setCurrentTeacher, (req, res) => {

      let options = { 
        admin: req.user.roles.includes('admin'),
        teacherPrivileges: req.user.roles.includes('admin') || req.user.currentTeacher
      };
      var courseId = req.params.courseId;

      db.models.Thread.find({ courseId: courseId }).limit(10).sort({ bumped_on: -1 }).exec((err, threads) => {

          threads.forEach(thread => {
              thread.replies = thread.replies.sort((a, b) => {
                  return (a.created_on < b.created_on);
              }).slice(0, 3);
          })
          options.threads = threads;
          res.render('partials/messageBoard.hbs', options);
      })
  })

  app.route('/api/threads/:courseId')
    .post(ensureAuthenticated, (req,res) => {

      let courseId = req.params.courseId;
      let text = req.body.text;
      let date = new Date();

        let newThread = {
          courseId: courseId,
          text: text,
          created_on: date,
          bumped_on: date,
          reported: false,
          author: req.user.firstname + ' ' + req.user.surname,
          replies: []
        }

        db.models.Thread.create(newThread, (err,thread) => {

          if (err) {
            res.send(err.message);
          } else {
            res.send({success: "New thread added."});
            // res.redirect(302, '/b/' + board + '/');
          }
        })
          
      })

    // Use
    .get(ensureAuthenticated, (req,res) => {
      let courseId = req.params.courseId;

      db.models.Thread.find({courseId: courseId}).limit(10).sort({ bumped_on: -1 }).select('-reported').exec((err, threads) => {
        if (err) {
          res.send(err.message);
        } else {
          threads.forEach(thread => {
            thread.replies = thread.replies.sort((a,b) => {
              return (a.created_on < b.created_on);
            }).slice(0,3);
          })
          res.json(threads);
        }
      })
    })

    .delete(ensureAuthenticated, ensureAdminOrTeacher, (req,res) => {

      let threadId = req.body.threadId;

      db.models.Thread.findOne({ _id: threadId }, (err,thread) => {
          if (err) {
            res.send(err.message);
          } else {
              thread.remove((err) => {
                  res.send('thread deleted');
              })
          }
        })
      })

    .put(ensureAuthenticated, (req,res) => {
      
      let threadId = req.body.threadId;
      db.models.Thread.findOne({ _id: threadId }, (err,thread) => {
        if (err) {
          res.send(err.message);
        } else {
          thread.reported = true;
          thread.save(err => {
            if (err) {
              res.send(err.message);
            } else {
              res.send('thread has been reported');
            }
          })
        }
      })
    })


  app.route('/api/replies/:courseId')
      .post(ensureAuthenticated, (req,res) => {

      let courseId = req.params.courseId;
      let text = req.body.text;
      let threadId = req.body.threadId;
      
      db.models.Thread.findOne({_id: threadId}, (err,thread) => {

        if (err) {
          res.send(err.message);
        } else {
            let date = new Date();
            thread.bumped_on = date;
            thread.replies = [...thread.replies, new db.models.Reply({
              text: text,
              author: req.user.firstname + ' ' + req.user.surname,
              created_on: date
            })];
            thread.save((err,thread) => {
              if (err) {
                res.send(err.message);
              } else {
                
                res.send(thread);
                // res.redirect(302, '/b/' + courseId + "/" + thread_id);
              }
            })
          
        }
      })
    })

    .get(ensureAuthenticated, (req,res) => {
        let courseId = req.params.courseId;
        let threadId = req.query.threadId;

        db.models.Thread.findOne({courseId: courseId, _id: threadId}).select('-reported').exec((err, thread) => {
          if (err) {
            res.send(err.message);
          } else {
            res.json(thread);
          }
        })
      })

    .delete(ensureAuthenticated, ensureAdminOrTeacher, (req,res) => {
      let threadId = req.body.threadId;
      let replyId = req.body.replyId;
      

      db.models.Thread.findOne({ _id: threadId }, (err,thread) => {
        if (err) {
          res.send(err.message);
        } else {
          let replyIndex = thread.replies.findIndex(el => {
              return el._id == replyId;
          });
          thread.replies[replyIndex].text = '[deleted]';
          thread.save(err => {
            res.send(err? err.message: 'reply deleted');
          })
        }
      })
    })

    .put((req,res) => {

        let threadId = req.body.threadId;
        let replyId = req.body.replyId;
        db.models.Thread.findOne({ _id: threadId }, (err,thread) => {
          if (err) {
            res.send(err.message);
          } else {

            let replyIndex = thread.replies.findIndex(el => {
              return el._id == replyId;
            });

            thread.replies[replyIndex].reported = true;
            thread.save(err => {
                res.send(err? err.message: 'reply has been reported');
            })
          }
        })

    })

}