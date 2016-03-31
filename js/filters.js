'use strict';

/* Filters */

bpApp.filter('titleCase', function () {
  return function (input) {
    var words = input.split(' ');
    for (var i = 0; i < words.length; i++) {
      words[i] = words[i].toLowerCase(); // lowercase everything to get rid of weird casing issues
      words[i] = words[i].replace('_', ' ');
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(' ');
  }
});

bpApp.filter('cropStart', function() {
    return function(input) {
        var start = input.slice(5); //remove the year from the date.
        return start;
    }
});

bpApp.filter('startFrom', function() {
    return function(input, start) {
        if (!input || !input.length) { return; }
        start = +start; //parse to int
        return input.slice(start);
    }
});

//angular.module('ng')
bpApp.filter('tel', function () {
    return function (tel) {
        if (!tel) { return ''; }

        var value = tel.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
            return tel;
        }

        var country, city, number;

        switch (value.length) {
            case 10: // +1PPP####### -> C (PPP) ###-####
                country = 1;
                city = value.slice(0, 3);
                number = value.slice(3);
                break;

            case 11: // +CPPP####### -> CCC (PP) ###-####
                country = value[0];
                city = value.slice(1, 4);
                number = value.slice(4);
                break;

            case 12: // +CCCPP####### -> CCC (PP) ###-####
                country = value.slice(0, 3);
                city = value.slice(3, 5);
                number = value.slice(5);
                break;

            default:
                return tel;
        }

        if (country == 1) {
            country = "";
        }

        number = number.slice(0, 3) + '-' + number.slice(3);

        return (country + " (" + city + ") " + number).trim();
    };
});

bpApp.filter('getDate', function () {
  return function (input) {
    var date = input.split('T');
    return date[0];
  }
});

bpApp.filter('toDate', function () {
  return function (input) {
    var dateFinal = '';
    if (input != undefined) {
        var date = new Date(input);
        var dateStr = date.toString().split(' ');
        dateFinal = dateStr[1] + ' ' + dateStr[2] + ', ' + dateStr[3];
    }
    return dateFinal;
  }
});

bpApp.filter('bgReceiptNumber', function () {
  return function (input) {
    var temp = '111111111111111';
    var inputLength = 0;
    var lastChar = '';
    if (input != undefined) {
        temp = input.replace(/-/g,'');
        inputLength = temp.length;
        lastChar = temp.slice(-1);
    }
    var num = temp;
    var afterEvery = 5;
    var maxDigits = 15;
    var section = temp.match(/.{1,5}/g);
    var maxSection = Math.floor(maxDigits/afterEvery);

    if (isNaN(lastChar) || inputLength > maxDigits) {
        temp = temp.substring(0,inputLength-1);
    }
    
    /** 
    //HARD CODED VERSION
    num = temp.substring(0,5);
    if (temp.length > 10) {
        num += '-';
        num += temp.substring(5,10);
        num += '-';
        num += temp.substring(10,15);
    } else if (temp.length > 5) {
        num += '-'; 
        num += temp.substring(5,10);
    }
    /**/
    
    /**/ 
    //GENERIC VERSION
    num = temp.substring(0,afterEvery);
    if (section.length-1 != 0) {
        num += addToInput(temp, section.length-1, afterEvery);
    }
    if (section.length-1 == maxSection) {
        num = num.substring(0, num.length-1);
    }

    function addToInput(str, sec, every) {
        var returnInput = '';
        for (var x=1; x<=sec; x++) {
            returnInput  += '-';
            returnInput  += str.substring(x*every,(x+1)*every);
        }
        return returnInput;
    }
    /**/

    return num;
  }
});

bpApp.filter('convertDateYYYYMMDD', function () {
    return function (input) {
        var getyear = input.getFullYear();
        var getmonth = '0' + (input.getMonth()+1);
        getmonth = getmonth.toString().slice(-2);
        var getday = '0' + input.getDate();
        getday = getday.toString().slice(-2);
        return getyear + getmonth + getday;
  }
});

bpApp.filter('stripDashes', function () {
    return function (input) {
        var str = input.replace(/-/g,'');
        return str;
    }
});
