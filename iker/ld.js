/**
 * ECMAScript-262 V5 Implementation of the Core RDF Interfaces
 * 
 *  - <http://www.w3.org/2010/02/rdfa/sources/rdf-interfaces/>
 *  - <http://github.org/webr3/rdf-interfaces/>
 *  
 * This is free and unencumbered software released into the public domain.
 * For more information, please refer to <http://unlicense.org/>
 */
rdf = (function() {
  var rdf = {};
  rdf.encodeString = function(s) {
    var out = "", skip = false, _g1 = 0, _g = s.length;
    while(_g1 < _g) {
      var i = _g1++;
      if(!skip) {
        var code = s.charCodeAt(i);
        if(55296 <= code && code <= 56319) {
          var low = s.charCodeAt(i + 1);
          code = (code - 55296) * 1024 + (low - 56320) + 65536;
          skip = true
        }
        if(code > 1114111) { throw new Error("Char out of range"); }
        var hex = "00000000".concat((new Number(code)).toString(16).toUpperCase());
        if(code >= 65536) {
          out += "\\U" + hex.slice(-8)
        } else {
          if(code >= 127 || code <= 31) {
            switch(code) {
              case 9:  out += "\\t"; break;
              case 10: out += "\\n"; break;
              case 13: out += "\\r"; break;
              default: out += "\\u" + hex.slice(-4); break
            }
          } else {
            switch(code) {
              case 34: out += '\\"'; break;
              case 92: out += "\\\\"; break;
              default: out += s.charAt(i); break
            }
          }
        }
      } else {
        skip = !skip
      }
    }
    return out
  };
  
  rdf.BlankNode = function() {
    return Object.defineProperties( {}, {
      interfaceName: { writable: false, configurable : false, enumerable: true, value: 'BlankNode' },
      nominalValue: { writable: false, configurable : false, enumerable: true, value: 'b'.concat(++rdf.BlankNode.NEXTID) },
      valueOf: { writable: false, configurable : false, enumerable: true, value: function() {
        return this.nominalValue;
      }},
      equals: { writable: true, configurable : false, enumerable: true, value: function(o) {
        if(!o.hasOwnProperty('interfaceName')) {
          if(typeof o == 'function' && o.constructor.name == 'RegExp')
            return o.test(this.valueOf().toString());
          return this.valueOf() == o;
        }
        return (o.interfaceName == this.interfaceName) ? this.nominalValue == o.nominalValue : false;
      }},
      toString: { writable: false, configurable : false, enumerable: true, value: function() {
        return '_:'.concat(this.nominalValue);
      }},
      toNT: { writable: false, configurable : false, enumerable: true, value: function() {
        return rdf.encodeString(this.toString());
      }},
      h: { configurable : false, enumerable: false, get: function(){return this.nominalValue} },
    })
  };
  rdf.BlankNode.NEXTID = 0;
  
  rdf.NamedNode = function(iri) {
    return Object.defineProperties( {}, {
      interfaceName: { writable: false, configurable : false, enumerable: true, value: 'NamedNode' },
      nominalValue: { writable: false, configurable : false, enumerable: true, value: iri },
      valueOf: { writable: false, configurable : false, enumerable: true, value: function() {
        return this.nominalValue;
      }},
      equals: { writable: true, configurable : false, enumerable: true, value: function(o) {
        if(!o.hasOwnProperty('interfaceName')) {
          if(typeof o == 'function' && o.constructor.name == 'RegExp')
            return o.test(this.valueOf().toString());
          return this.valueOf() == o;
        }
        return (o.interfaceName == this.interfaceName) ? this.nominalValue == o.nominalValue : false;
      }},
      toString: { writable: false, configurable : false, enumerable: true, value: function() {
        return this.nominalValue.toString();
      }},
      toNT: { writable: false, configurable : false, enumerable: true, value: function() {
        return '<' + rdf.encodeString(this.toString()) + '>';
      }},
      h: { configurable : false, enumerable: false, get: function(){return this.nominalValue} }
    })
  };
  
  rdf.Literal = function(value, language, datatype, nativ) {
    if(typeof language == "string" && language[0] == "@") language = language.slice(1);
    return Object.defineProperties( {}, {
      interfaceName: { writable: false, configurable : false, enumerable: true, value: 'Literal' },
      nominalValue: { writable: false, configurable : false, enumerable: true, value: value },
      valueOf: { writable: false, configurable : false, enumerable: true, value: function() {
        return nativ === null ? this.nominalValue : nativ;
      }},
      language: { writable: false, configurable : false, enumerable: true, value: language },
      datatype: { writable: false, configurable : false, enumerable: true, value: datatype },
      equals: { writable: true, configurable : false, enumerable: true, value: function(o) {
        if(!o.hasOwnProperty('interfaceName')) {
          if(typeof o == 'function' && o.constructor.name == 'RegExp')
            return o.test(this.valueOf().toString());
          return this.valueOf() == o;
        }
        if(o.interfaceName != this.interfaceName) return false;
        return this.h == o.h;
      }},
      toString: { writable: false, configurable : false, enumerable: true, value: function() {
        return this.nominalValue.toString();
      }},
      toNT: { writable: false, configurable : false, enumerable: true, value: function() {
        var s = '"' + rdf.encodeString(this.nominalValue) + '"';
        if( Boolean(this.language).valueOf() ) return s.concat('@' + this.language);
        if( Boolean(this.datatype).valueOf() ) return s.concat('^^' + this.datatype.toNT());
        return s;
      }},
      h: { writable: false, configurable : false, enumerable: false, value: language + '|' + (datatype ? datatype.toString() : '') + '|' + value.toString() }
    })
  };
  
  rdf.Triple = function(s,p,o) {
    return Object.defineProperties( {}, {
      subject: { writable: false, configurable : false, enumerable: true, value: s },
      property: { writable: false, configurable : false, enumerable: true, value: p },
      object: { writable: false, configurable : false, enumerable: true, value: o },
      equals: { writable: true, configurable : false, enumerable: true, value: function(t) {
        return this.s.equals(t.s) && this.p.equals(t.p) && this.o.equals(t.o);
      }},
      toString: { writable: false, configurable : false, enumerable: true, value: function() {
        return this.s.toNT() + " " + this.p.toNT() + " " + this.o.toNT() + " .";
      }},
      s: { configurable : false, enumerable: false, get: function() { return this.subject } },
      p: { configurable : false, enumerable: false, get: function() { return this.property } },
      o: { configurable : false, enumerable: false, get: function() { return this.object } }
    })
  };
   
  rdf.Graph = function(a) {
    return Object.defineProperties( {}, {
      _graph: { writable: true, configurable : false, enumerable: false, value: [] },
      _spo: { writable: true, configurable : false, enumerable: false, value: {} },
      length: { configurable : false, enumerable: true, get: function() {
        return this._graph.length;
      }},
      add: { writable: false, configurable : false, enumerable: true, value: function(t) {
        this._spo[t.s.h] || (this._spo[t.s.h] = {});
        this._spo[t.s.h][t.p.h] || (this._spo[t.s.h][t.p.h] = {});
        if(!this._spo[t.s.h][t.p.h][t.o.h]) {
          this._spo[t.s.h][t.p.h][t.o.h] = t;
          this._graph.push(t);
          this.actions.forEach(function(a){a.run(t)});
        }
        return this;
      }},
      addArray: { writable: false, configurable : false, enumerable: false, value: function(a) {
        if(Array.isArray(a)) var g = this, b = a.forEach( function(t) { g.add(t) });
        return this;
      }},
      remove: { writable: false, configurable : false, enumerable: true, value: function(t) {
        this._spo[t.s.h] && this._spo[t.s.h][t.p.h] && this._spo[t.s.h][t.p.h][t.o.h] && (
          delete this._spo[t.s.h][t.p.h][t.o.h] &&
          this._graph.splice(this._graph.indexOf(t),1)  
        );
        return this;
      }},
      removeMatches: { writable: false, configurable : false, enumerable: true, value: function(s,p,o) {
        s = arguments[0] === undefined ? null : s;
        p = arguments[1] === undefined ? null : p;
        o = arguments[2] === undefined ? null : o;
        var r = [];
        this.forEach(function(t,g) {
          (s===null||t.s.equals(s)) && (p===null||t.p.equals(p)) && (o===null||t.o.equals(o)) && r.push(t);
        });
        for(i in r) this.remove(r[i]);
        return this;
      }},
      toArray: { writable: false, configurable : false, enumerable: true, value: function() {
        return this._graph.slice(0);
      }},
      some: { writable: false, configurable : false, enumerable: true, value: function(cb) {
        return this._graph.some(cb);
      }},
      every: { writable: false, configurable : false, enumerable: true, value: function(cb) {
        return this._graph.every(cb);
      }},
      filter: { writable: false, configurable : false, enumerable: true, value: function(cb) {
        return new rdf.Graph(this._graph.filter(cb));
      }},
      forEach: { writable: false, configurable : false, enumerable: true, value: function(cb) {
        var g = this; this._graph.forEach(function(t) { cb(t,g) });
      }},
      match: { writable: false, configurable : false, enumerable: true, value: function(s,p,o,l) {
        s = arguments[0] === undefined ? null : s;
        p = arguments[1] === undefined ? null : p;
        o = arguments[2] === undefined ? null : o;
        l = arguments[3] === undefined ? null : l;
        var c = 0;
        if(l<1) l=-1;
        return new rdf.Graph(this._graph.filter(function(t) {
          if(c == l) return false;
          return (s===null||t.s.equals(s)) && (p===null||t.p.equals(p)) && (o===null||t.o.equals(o)) && ++c;
        }));
      }},
      merge: { writable: false, configurable : false, enumerable: true, value: function(g) {
        return new rdf.Graph().addAll(this).addAll(g);
      }},
      addAll: { writable: false, configurable : false, enumerable: true, value: function(g) {
        return this.addArray(g.toArray());
      }},
      actions: { writable: false, configurable : false, enumerable: true, value: [] },
      addAction: { writable: false, configurable : false, enumerable: true, value: function(a,r) {
        if(r) this.forEach(function(t,g){a.run(t,g)});
        this.actions.push(a);
        return this;
      }}
    }).addArray(a);
  };
  
  rdf.TripleAction = function(test,action) {
    return Object.defineProperties( {}, {
      action: { writable: true, configurable : false, enumerable: true, value: action },
      test: { writable: true, configurable : false, enumerable: true, value: test },
      run: { writable: false, configurable : false, enumerable: true, value: function(t,g) {
        if(this.test(t)) this.action(t,g);
      }}    
    })
  };
  
  rdf.PrefixMap = function(i) {
    return Object.defineProperties( {} , {
      resolve: { writable: false, configurable : false, enumerable: true, value: function(curie) {
        var index = curie.indexOf(":");
        if(index < 0 || curie.indexOf("//") >= 0)  return null;
        var prefix = curie.slice(0, index).toLowerCase();
        if(!this[prefix]) return null;
        return this[prefix].concat( curie.slice(++index) );
      }},
      shrink: { writable: false, configurable : false, enumerable: true, value: function(iri) {
        for(pref in this)
          if(iri.substr(0,this[pref].length) == this[pref])
            return pref + ':' + iri.slice(this[pref].length);
        return iri;
      }},
      setDefault: { writable: false, configurable : false, enumerable: true, value: function(iri) {
        this[''] = iri;
      }},
      addAll: { writable: false, configurable : false, enumerable: true, value: function(prefixes, override) {
        for(p in prefixes)
          if(!this[p] || override)
            this[p] = prefixes[p];
        return this;
      }}	  
    }).addAll(i);
  };
  
  rdf.TermMap = function(i) {
    return Object.defineProperties( {} , {
      resolve: { writable: false, configurable : false, enumerable: true, value: function(term) {
        if(this[term]) return this[term]
        if(this[""]) return this[""].concat(term)
        return null;
      }},
      shrink: { writable: false, configurable : false, enumerable: true, value: function(iri) {
        for(t in this)
          if(this[t] == iri) return t;
        return iri;
      }},
      setDefault: { writable: false, configurable : false, enumerable: true, value: function(iri) {
        this[''] = iri;
      }},
      addAll: { writable: false, configurable : false, enumerable: true, value: function(terms, override) {
        for(t in terms)
          if(!this[t] || override)
            this[t] = terms[t];
        return this;
      }}
    }).addAll(i);
  }
  
  rdf.Profile = function(i) {
    return Object.defineProperties( {} , {
      prefixes: { writable: false, configurable : false, enumerable: true, value: new rdf.PrefixMap },
      terms: { writable: false, configurable : false, enumerable: true, value: new rdf.TermMap },
      resolve: { writable: false, configurable : false, enumerable: true, value: function(tp) {
        return tp.indexOf(":") >= 0 ? this.prefixes.resolve(tp) : this.terms.resolve(tp);
      }},
      setDefaultVocabulary: { writable: false, configurable : false, enumerable: true, value: function(iri) {
        this.terms.setDefault(iri);
      }},
      setDefaultPrefix: { writable: false, configurable : false, enumerable: true, value: function(iri) {
        this.prefixes.setDefault(iri);
      }},
      setTerm: { writable: false, configurable : false, enumerable: true, value: function(term, iri) {
        this.terms[term] = iri;
      }},
      setPrefix: { writable: false, configurable : false, enumerable: true, value: function(prefix, iri) {
        this.prefixes[prefix] = iri;
      }},
      importProfile: { writable: false, configurable : false, enumerable: true, value: function(profile, override) {
        if(!profile) return this;
        this.prefixes.addAll(profile.prefixes, override);
        this.terms.addAll(profile.terms, override);
        return this;
      }}
    }).importProfile(i);
  };
  
  rdf.RDFEnvironment = function() {
    var rp = {terms:{},prefixes:{
      owl: "http://www.w3.org/2002/07/owl#",
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      rdfa: "http://www.w3.org/ns/rdfa#",
      xhv: "http://www.w3.org/1999/xhtml/vocab#",
      xml: "http://www.w3.org/XML/1998/namespace",
      xsd: "http://www.w3.org/2001/XMLSchema#",
    }};
    var xsd = {};
    for(v in x=['string','boolean','dateTime','date','time','int','double','float','decimal','integer',
              'nonPositiveInteger','negativeInteger','long','int','short','byte','nonNegativeInteger',
              'unsignedLong','unsignedInt','unsignedShort','unsignedByte','positiveInteger'])
      xsd[x[v]] = rp.prefixes.xsd.concat(x[v]);
    return Object.defineProperties( new rdf.Profile(rp), {
      createBlankNode: { writable: false, configurable : false, enumerable: true, value: function() {
        return new rdf.BlankNode;
      }},
      createNamedNode: { writable: false, configurable : false, enumerable: true, value: function(iri) {
        return new rdf.NamedNode(iri);
      }},
      createLiteral: { writable: false, configurable : false, enumerable: true, value: function(value) {
        var l = null, dt = arguments[2], v = value;
        if(arguments[1]) {
          if(arguments[1].hasOwnProperty('interfaceName')) dt = arguments[1];
          else l = arguments[1];
        }
        if(dt) {
          switch(dt.valueOf()) {
            case xsd.string:
              v = new String(v); break;
            case xsd['boolean']:
              v = (new Boolean(v == "false" ? false : v)).valueOf(); break;
            case xsd['float']:
            case xsd.integer:
            case xsd['long']:
            case xsd['double']:
            case xsd.decimal:
            case xsd.nonPositiveInteger:
            case xsd.nonNegativeInteger:
            case xsd.negativeInteger:
            case xsd['int']:
            case xsd.unsignedLong:
            case xsd.positiveInteger:
            case xsd['short']:
            case xsd.unsignedInt:
            case xsd['byte']:
            case xsd.unsignedShort:
            case xsd.unsignedByte:
              v = (new Number(v)).valueOf(); break;
            case xsd['date']:
            case xsd.time:
            case xsd.dateTime:
              v = new Date(v); break;
          }
        }
        return new rdf.Literal(value,l,dt,v);
      }},
      createTriple: { writable: false, configurable : false, enumerable: true, value: function(s,p,o) {
        return new rdf.Triple(s,p,o);
      }},
      createGraph: { writable: false, configurable : false, enumerable: true, value: function(a) {
        return new rdf.Graph(a);
      }},
      createAction: { writable: false, configurable : false, enumerable: true, value: function(t,a) {
        return new rdf.TripleAction(t,a);
      }},
      createProfile: { writable: false, configurable : false, enumerable: true, value: function(empty) {
        return new rdf.Profile(!empty ? this : null);
      }},
      createTermMap: { writable: false, configurable : false, enumerable: true, value: function(empty) {
        return new rdf.TermMap(!empty ? this.terms : null);
      }},
      createPrefixMap: { writable: false, configurable : false, enumerable: true, value: function(empty) {
        return new rdf.PrefixMap(!empty ? this.prefixes : null);
      }}
    });
  };
  var _ = new rdf.RDFEnvironment;
  Object.keys(rdf).forEach(function(k) {
    _[k] = rdf[k];
  });
  return rdf = _;
})();

//if(module) module.exports = rdf; 

 //Made by IKER
  function XMLRDFSerializer(environment) {
	if(!environment) environment=new RDFEnvironment;
	this.environment = environment;
  this.prf=new Array();
  this.prf.rdf= 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
	};
	
	  XMLRDFSerializer.prototype.prefix =function(cu) {
	  var curie= cu.toString();
	  //alert(curie);
	    if (curie==null) return null;
        var index = curie.indexOf(":");
        if(index < 0 || curie.indexOf("//") >= 0)  return null;
        var prefix = curie.slice(0, index).toLowerCase();
        return prefix;
      };
      
	  
      XMLRDFSerializer.prototype.serialize = function(g) {
	     var arr = g.toArray();
		 if (arr.length== 0 ){return "";}
		 var t = arr[0];
		 var s = t.s;
		 var px=this.prefix(s); 
		 var iri= this.environment.prefixes[px];
		 if (px!= null && iri!= null){
			this.prf[px]=iri;
			//alert(this.prf[px]);
		 }
		 var txt = ""; //<rdf:RDF xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'>\n<rdf:Description rdf:about='"+s+"'>";
		 for (var index = 0; index < arr.length; ++index) {
			var t=arr[index];
			var prop=t.p.toString();			
			var obj=t.o.toString();
			px=this.prefix(prop);
			iri= this.environment.prefixes[px];
		 	if (px!= null && iri!= null){
				this.prf[px]=iri;
				//alert(this.prf[px]);
		 	}
		 	px=this.prefix(obj);
			iri= this.environment.prefixes[px];
		 	if (px!= null && iri!= null){
				this.prf[px]=iri;
				//alert(this.prf[px]);
		 	}

			if (t.o.interfaceName =='NamedNode'){
txt = txt + "\n\t <"+prop+" rdf:resource=\""+obj+"\"/>";
			}else{
				txt = txt + "\n\t <"+prop+">"+obj+"</"+prop+">";
			}
		 }

     var txt2 = "<rdf:Description rdf:about='"+s+"' ";
    for (var key in this.prf) {
       if (key === 'length' || !this.prf.hasOwnProperty(key)) continue;
       var value = this.prf[key];
       txt2=txt2+"\n xmlns:"+ key+"='"+value+"'";      
    }
    txt2=txt2+">";
     
		 txt = txt2+txt+"\n</rdf:Description>";
     return txt;
      };
	   
 function LD (){
   this.insList = new Array();
   this.insCount=0;
   
   
 /* LD.prototype.createInstance = function (URI, type, ns){
   var instance = new ins();
   instance.URI = URI.trim();
   instance.s = rdf.createNamedNode(URI);
   type=type.trim();
    if (type.indexOf(":")>-1 && ns != null){
		var prefix = type.substring (0, type.indexOf(":"));
		ns=ns.trim();
		instance.addNameSpace (prefix, ns);
	}
   if (type !=null){
	instance.addNameSpace ("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
	instance.addOneProperty("rdf:type", type);
   }
   LD.insList[LD.insCount]=instance;
   LD.insCount++;
   return instance;
 };  
 */
   
  ins = function() {  
    this.URI;
    this.env = new rdf.RDFEnvironment;
    this.g = rdf.createGraph();
	this.s;   //The Subject= URI	
	this.isMulti=false;
 };
 
  multiIns = function() {  
    this.instances= new Array();
	this.count=0;
	this.isMulti=true;
 };
 
   multiIns.prototype.toString = function (){
	var txt="";
	for (var i = 0; i < arrayLength; i++) {
		txt+="\n"+this.instances[i].toString();
	}	
	return txt;
  };
 
  multiIns.prototype.add = function (ins){
	this.instances[this.count] = ins;
	this.count++;
  }  
  
  multiIns.prototype.addNameSpace = function (prefix, ns){
	for (var i = 0; i < arrayLength; i++) {
		this.instances[i].addNameSpace(prefix, ns);
	}	
	return this;
	}; 
	
  multiIns.prototype.addProperty = function (property, values, processor){
	for (var i = 0; i < arrayLength; i++) {
		this.instances[i].addProperty(property, values, processor);
	}	
	return this;
 }
   
  LD.prototype.createInstance = function (URIs){
  
  if ( Object.prototype.toString.call(URIs) == '[object String]'){
        return LD.createOneInstance (URIs.trim());
	}else{if ( Object.prototype.toString.call(URIs) == '[object XML]'){
		return LD.createOneInstance (URIs.toString().trim());
	}else{if ( Object.prototype.toString.call(URIs) == '[object Array]'){
		var instances = new multiIns();
		for (var i in URIs){
			instances.add(LD.createOneInstance (URIs[i].trim()));
		}
		return instances;
	}else {if ( Object.prototype.toString.call(values) == '[object XMLList]'){
		var instances = new multiIns();		
		for (var i = 0; i<values.length(); i++){
			instances.add(LD.createOneInstance (URIs[i].toString().trim()));
		}
		return instances;
	}}}}
	
 };  
 
   LD.prototype.createOneInstance = function (URI){
   var instance = new ins();
   instance.URI = URI.trim();
   instance.s = rdf.createNamedNode(URI);
   LD.insList[LD.insCount]=instance;
   LD.insCount++;
   return instance;
 };  

 
  ins.prototype.addProperty = function (property, values, processor){
	if (typeof processor == 'undefined' ){
		var processor= function (value){return value;};
	}
	if ( Object.prototype.toString.call(values) == '[object String]'){
        var value=processor(values.trim());
		this.addOneProperty(property, value);
	}else{if ( Object.prototype.toString.call(values) == '[object XML]'){
        var value=processor(values.toString().trim());
		this.addOneProperty(property, value);
	}else{if ( Object.prototype.toString.call(values) == '[object Array]'){
		for (var i in values){
			var value = processor(values[i].trim());
			this.addOneProperty(property, value);
		}
	}else {if ( Object.prototype.toString.call(values) == '[object XMLList]'){
		for (var i = 0; i<values.length(); i++){
			var value = processor(values[i].toString().trim());
			this.addOneProperty(property, value);
		}
	}}}}
	return this;
 }
 
 ins.prototype.addOneProperty = function (property, values){
  var s = this.env.createNamedNode(this.URI);   //The Subject= URI
	var p = this.env.createNamedNode(property);
	var o;
	if ( Object.prototype.toString.call(values) == '[object String]'){
		var value = values.trim();
		var prefix = this.prefix(value);
		if (prefix!=null){
			var iri= this.env.prefixes[prefix];
			if (iri != null){
				value= value.replace(prefix+":",iri);
			}		
		}	
		if (value.indexOf("http") == 0){
			o = this.env.createNamedNode(value);	
		}else{
			o=this.env.createLiteral(value);
		}	
		var t= this.env.createTriple(s,p,o);
		this.g.add(t);
	}else{if ( Object.prototype.toString.call(values) == '[object XML]'){
		var value = values.toString().trim();
		var prefix = this.prefix(value);
		if (prefix!=null){
			var iri= this.env.prefixes[prefix];
			if (iri != null){
				value= value.replace(prefix+":",iri);
			}		
		}	
		if (value.indexOf("http") == 0){
			o = this.env.createNamedNode(value);	
		}else{
			o=this.env.createLiteral(value);
		}	
		var t= this.env.createTriple(s,p,o);
		this.g.add(t);
	}	
   }
   return this;
};
  
    ins.prototype.addLiteralProperty = function (property, values, processor){
	  
	if (typeof processor == 'undefined' ){
		var processor= function (value){return value;};
		}
	if ( Object.prototype.toString.call(values) == '[object String]'){
        var value=processor(values.trim());
		this.addOneLiteralProperty(property, value);
	}else{if ( Object.prototype.toString.call(values) == '[object XML]'){
        var value=processor(values.toString().trim());
		this.addOneLiteralProperty(property, value);
	}else{if ( Object.prototype.toString.call(values) == '[object Array]'){
		for (var i in values){
			var value = processor(values[i].trim());
			this.addOneLiteralProperty(property, value);
		}
	}else {if ( Object.prototype.toString.call(values) == '[object XMLList]'){
		for (var i = 0; i<values.length(); i++){
			var value = processor(values[i].toString().trim());
			this.addOneLiteralProperty(property, value);
		}
	}}}}
	return this;
 }
 
  
 ins.prototype.addOneLiteralProperty = function (property, values){
    var s = this.env.createNamedNode(this.URI);   //The Subject= URI
	var p = this.env.createNamedNode(property);
	var o;
	if ( Object.prototype.toString.call(values) == '[object String]'){
		var value = values.trim();
		o=this.env.createLiteral(value);
		var t= this.env.createTriple(s,p,o);
		this.g.add(t);
	}else{if ( Object.prototype.toString.call(values) == '[object XML]'){
		var value = values.toString().trim();
		o=this.env.createLiteral(value);
		var t= this.env.createTriple(s,p,o);
		this.g.add(t);
	}
	}
	return this;
	};
  
  
  ins.prototype.addNameSpace = function (prefix, ns){
	this.env.setPrefix (prefix, ns);
	return this;
	}; 
	
  ins.prototype.serialize = function (){
	var XMLRDF= new XMLRDFSerializer(this.env);
	var xml=XMLRDF.serialize(this.g);
var rdftxt= "<rdf:RDF xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'>"
var rdftxt2= "</rdf:RDF>";

	try {
		return new XML (rdftxt+xml+rdftxt2);
	}
	catch(err) {

			y.log(err);
		
		return xml;
	}
  };
  
    ins.prototype.toString = function (){
	var XMLRDF= new XMLRDFSerializer(this.env);
	var xml=XMLRDF.serialize(this.g);
	return xml;
  };
  
  ins.prototype.prefix =function(cu) {
	  var curie= cu.toString();
	    if (curie==null) return null;
        var index = curie.indexOf(":");
        if(index < 0 || curie.indexOf("//") >= 0)  return null;
        var prefix = curie.slice(0, index);
        return prefix;
      };      
 };
 
  LD.prototype.serialize = function (){
	var txt="";
var rdftxt= "<rdf:RDF xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'>"
var rdftxt2= "</rdf:RDF>";
	for (var i=0; i < LD.insList.length; i++){
		var instance = LD.insList[i];
		txt +=instance.toString()+"\n";
	}	
	try { 
		//txt=txt.replace(/&/g, '&amp;')
		txt=rdftxt+txt+rdftxt2;
		y.log(txt);
        return new XML (txt);
	//return txt;
	}
	catch(err) {
		y.log(err);
		y.log(txt);
		return txt;
	}
  };
 
    function processList(data, func){
	if ( Object.prototype.toString.call(data) == '[object XMLList]'){ 
		var first=true;
		for (var i =0; i<data.length(); i++){		
			var tst=func(data[i]);
            if (typeof tst != 'undefined'){
				if (first==true){	
					first=false;
					var newList=<list>{tst}</list>;
				}else{
				    newList+=<list>{tst}</list>;
				}
			}
		}
	}else{
		
		var newList=func(data);
	}
    y.log('LIST\n '+ newList);
	return newList;
 };  
 
LD = new LD();
//processListElements = new processList();

//y.env("http://datatables.org/alltables.env"); 
y.env("store://3KN9e5FWbSC9wFngrdxRWM"); 
 
 //TODO
 // gestion namespace por defecto. el prefix vacio
 //diferencia entre prefix, term
