(this["webpackJsonpcontentful-app"]=this["webpackJsonpcontentful-app"]||[]).push([[0],{12:function(e,t,n){e.exports=n(21)},19:function(e,t,n){},21:function(e,t,n){"use strict";n.r(t);var a=n(0),o=n.n(a),r=n(2),c=n(3),l=(n(17),n(18),n(19),n(4)),i=n.n(l),s=n(5),u=n(7),p=n(8),m=n(11),f=n(10),E=n(1),O=n(9),d=function(e){Object(m.a)(n,e);var t=Object(f.a)(n);function n(e){var a;return Object(u.a)(this,n),(a=t.call(this,e)).onConfigure=Object(s.a)(i.a.mark((function e(){var t;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,a.props.sdk.app.getCurrentState();case 2:return t=e.sent,e.abrupt("return",{parameters:a.state.parameters,targetState:t});case 4:case"end":return e.stop()}}),e)}))),a.state={parameters:{}},e.sdk.app.onConfigure((function(){return a.onConfigure()})),a}return Object(p.a)(n,[{key:"componentDidMount",value:function(){var e=Object(s.a)(i.a.mark((function e(){var t,n=this;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.props.sdk.app.getParameters();case 2:t=e.sent,this.setState(t?{parameters:t}:this.state,(function(){n.props.sdk.app.setReady()}));case 4:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){return o.a.createElement(E.d,{className:Object(O.a)({margin:"80px"})},o.a.createElement(E.a,null,o.a.createElement(E.b,null,"App Config"),o.a.createElement(E.c,null,"Welcome to your contentful app. This is your config page.")))}}]),n}(a.Component),C=function(e){return o.a.createElement(E.c,null,"Hello Entry Editor Component")},k=function(e){return o.a.createElement(E.c,null,"Hello Page Component")},h=function(e){return o.a.createElement(E.c,null,"Hello Sidebar Component")},b=function(e){return o.a.createElement(E.c,null,"Hello Entry Field Component")},g=function(e){return o.a.createElement(E.c,null,"Hello Dialog Component")};Object(c.init)((function(e){var t=document.getElementById("root");[{location:c.locations.LOCATION_APP_CONFIG,component:o.a.createElement(d,{sdk:e})},{location:c.locations.LOCATION_ENTRY_FIELD,component:o.a.createElement(b,{sdk:e})},{location:c.locations.LOCATION_ENTRY_EDITOR,component:o.a.createElement(C,{sdk:e})},{location:c.locations.LOCATION_DIALOG,component:o.a.createElement(g,{sdk:e})},{location:c.locations.LOCATION_ENTRY_SIDEBAR,component:o.a.createElement(h,{sdk:e})},{location:c.locations.LOCATION_PAGE,component:o.a.createElement(k,{sdk:e})}].forEach((function(n){e.location.is(n.location)&&Object(r.render)(n.component,t)}))}))}},[[12,1,2]]]);
//# sourceMappingURL=main.bc2e1d51.chunk.js.map