var extractYearMonth = function(date) {
    var month = date.getUTCMonth() + 1; //months from 1-12
    var year = date.getUTCFullYear();

    return {month: month, year: year};
};

var generateArchive = function(firstDate, endDate) {
    var archives = {};

    for (var year = firstDate.year; year <= endDate.year; year++) {
        archives[year] = {year: year, months: []};

        var startMonth = (year == firstDate.year) ? firstDate.month : 1;
        var endMonth = (year == endDate.year) ? endDate.month : 12;

        for (var month = startMonth; month <= endMonth; month++) {
            archives[year].months.push({monthNumber: month, monthName: months[month - 1]});
        }
    }

    return archives;
};
