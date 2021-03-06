module.exports = function(hbs) {

    hbs.registerHelper("booleanCheckboxHelper", function(boolean) {
        let str = "";
        if (boolean) str = "checked";
        return new hbs.SafeString(str);
      });
    
    hbs.registerHelper("plusOne", function(value) {
        return value+1;
    });

    hbs.registerHelper("limitLength", function(string) {
        if (string.length > 22) {
            return (string.substring(0,22) + '...');
        } else return string;
    });

    hbs.registerHelper("hideButton", function(button, currentQuestionNumber, totalQuestions) {
        switch (button) {
            case 'previous':
                if (currentQuestionNumber == 1) return 'd-none'; 
                break;
            case 'next':
                if (currentQuestionNumber == totalQuestions) return 'd-none';  
                break;
            case 'done':
                if (currentQuestionNumber != totalQuestions) return 'd-none'; 
                break;
        }
        return '';

    });

    hbs.registerHelper("disabledIf", function(boolean) {
        let str = '';
        if (boolean) str = "disabled";
        return new hbs.SafeString(str);
    });

    hbs.registerHelper("hideIf", function(boolean) {
        let str = '';
        if (boolean) str = "d-none";
        return new hbs.SafeString(str);
    });

    hbs.registerHelper("hideIfNot", function(boolean) {
        let str = '';
        if (!boolean) str = "d-none";
        return new hbs.SafeString(str);
    });

    hbs.registerHelper("hideIfNotEqual", function(string1, string2, string3) {
        let str = '';
        if (string1 != string2) {
            if (string3) {
                if (string1 != string3) str = "d-none";
            } else {
                str = "d-none";
            }
        }
        return new hbs.SafeString(str);
    });

    hbs.registerHelper("hideIfEqual", function(string1, string2, string3) {
        let str = '';
        if (string1 == string2) {
            if (string3) {
                if (string1 == string3) str = "d-none";
            } else {
                str = "d-none";
            }
        }
        return new hbs.SafeString(str);
    });

    hbs.registerHelper("selectedIfEqual", function(string1, string2, string3) {
        let str = '';
        if (string1 == string2 || string1 == string3) str = "selected";
        return new hbs.SafeString(str);
    });

    hbs.registerHelper("shortDate", function(date) {
        return date.toLocaleDateString();
    });

    hbs.registerHelper("jsDate", function(date) {
        var formatter = new Intl.DateTimeFormat('en-us', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });

        let [{value: month},,{value: day},,{value: year}] = formatter.formatToParts(date);
        return year + "-" + month + "-" + day;
    });

    hbs.registerHelper("calculateRows", function(string) {
        if (!string || string.length == 0) return 4;
        return Math.ceil(string.length / 45);
    });
    
    hbs.registerHelper("calculateRowsShort", function(string) {
        if (!string || string.length == 0) return 2;
        return Math.ceil(string.length / 37);
    });

    hbs.registerHelper("correctOrIncorrrect", function(correct) {
        let str = '';
        if (correct) { 
            str = '<strong style="color: green">Correct!</strong>';
        } else {
            str = '<strong style="color: red">Incorrect</strong>';
        }

        return new hbs.SafeString(str);
    });

    hbs.registerHelper("selectedForRole", function(roles, role) {
        if (roles && roles.includes(role)) {
            return 'selected';
        } else return '';
    });

    hbs.registerHelper("divide", function(one, two) {
        return one / two * 100;
    });
    
    hbs.registerHelper("reportedHelper", function(reported) {
        return reported? 'reported' : '';
    });

    hbs.registerHelper("secondsToMMSS", function(seconds) {
        return Math.floor(seconds/60) + ":" + (seconds%60).toLocaleString("en-US", { minimumIntegerDigits: 2 });
    });

    hbs.registerHelper("homeContentHelper", function(homeContent) {
        return new hbs.SafeString(homeContent);
    });

}