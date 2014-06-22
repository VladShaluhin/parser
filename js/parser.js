function Pattern(exec) {
    this.exec = exec;
	this.then = function (transform) {
        var p =  new Pattern(function (str, pos) {
            var r = exec(str, pos);
            return r && { res: transform(r.res), end: r.end };
        });
		return p;
    };
}


function txt(text) {
    return new Pattern(function (str, pos) {
        if (str.substr(pos, text.length) == text)
            return { res: text, end: pos + text.length };
    });
}

function rgx(regexp) {
    return new Pattern(function (str, pos) {
        var m = regexp.exec(str.slice(pos));
        if (m && m.index === 0)
            return { res: m[0], end: pos + m[0].length };
    });
}
//opt — он делает любой паттерн не обязательным,
// т.е. если исходный паттерн p не может распарсить текст, то opt(p) на этом же тексте скажет, что всё распарсилось, только результат парсинга пуст
function opt(pattern) {
    return new Pattern(function (str, pos) {
        return pattern.exec(str, pos) || { res: void 0, end: pos };
    });
}
//exc — он парсит только то, что может распарсить первый паттерн и не может распарсить второй
function exc(pattern, except) {
    return new Pattern(function (str, pos) {
        return !except.exec(str, pos) && pattern.exec(str, pos);
    });
}
//any — он берёт несколько паттернов и конструирует новый, который парсит то, что парсит первый из данных паттернов.
function any() {
	var patterns = [].slice.call(arguments, 0);
    return new Pattern(function (str, pos) {
        for (var r, i = 0; i < patterns.length; i++)
            if (r = patterns[i].exec(str, pos))
                return r;
    });
}
//seq — он последовательно парсит текст данной ему последовательностью паттернов и выдаёт массив результатов
function seq() {
	var patterns = [].slice.call(arguments, 0);
    return new Pattern(function (str, pos) {
        var i, r, end = pos, res = [];

        for (i = 0; i < patterns.length; i++) {
            r = patterns[i].exec(str, end);
            if (!r) return;
            res.push(r.res);
            end = r.end;
        }

        return { res: res, end: end };
    });
}
//rep — он много раз применяет известный паттерн к тексту и выдаёт массив результатов. 
function rep(pattern, separator) {
    var separated = !separator ? pattern :
        seq(separator, pattern).then(function (r){
			return r[1];
		});

    return new Pattern(function (str, pos) {
        var res = [], end = pos, r = pattern.exec(str, end);

        while (r && r.end > end) {
            res.push(r.res);
            end = r.end;
            r = separated.exec(str, end);
        }

        return { res: res, end: end };
    });
}