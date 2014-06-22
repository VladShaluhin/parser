var _name = rgx(/[a-z]+/i).then(function (s){
	return s.toLowerCase()
});


var char = rgx(/[^"&]/i);
var quoted = seq(txt('"'), rep(char), txt('"')).then(function(r){
	return r[1].join('');
});
var attr = seq(_name, txt('='), quoted).then(function(r){
	return { name: r[0], value: r[2] };
});

var wsp = rgx(/\s+/);

var attrs = rep(attr, wsp).then(function (r){
	var m = {}; 
	r.forEach(function (a){
		m[a.name] = a.value;
	})
	return m;
});


var header = seq(txt('<?xml'), wsp, attrs, txt('?>')).then(function (r){
	return r[2];
});

var text = rep(char).then(function(r){
	return r.join('')
});
var subnode = new Pattern(function (str, pos){
	return node.exec(str, pos);
});




var node = seq(
    txt('<'), _name, wsp, attrs, txt('>'),
    rep(any(text, subnode), opt(wsp)),
    txt('</'), _name, txt('>'))
    .then(function (r){
		return { name: r[1], attrs: r[3], nodes: r[5] };
	});

var xml = seq(header, node).then(function (r){
	return { root: r[1], attrs: r[0] };
});

var src = '<?xml version="1.0" encoding="utf-8"?>'+
'<book title="Book 1">'+
  '<chapter title="Chapter 1">'+
    '<paragraph>123</paragraph>'+
    '<paragraph>456</paragraph>'+
  '</chapter>'+
'</book>';

var headerSrc = '<?xml version="1.0" encoding="utf-8"?>';
console.log(
	xml.exec(src, 0)
);

