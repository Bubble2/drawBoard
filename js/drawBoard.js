function DrawBoard(){
	this.oCanvas=document.getElementById("canvas");
  	this.oCxt=this.oCanvas.getContext("2d");
  	this.iCvsLeft=this.oCanvas.offsetLeft;
  	this.iCvsTop=this.oCanvas.offsetTop;
	this.init();
}

DrawBoard.prototype={
	constructor: DrawBoard,

	init:function(){

	  	this.scroll();

	  	//设置默认的工具
  		this.colorChoose();
  		this.lineWidthChoose();
  		this.shapeChoose();
  		this.toolChoose();

  		//初始化工具事件
  		this.colorFn();
  		this.lineWidthFn();
  		this.shapeFn();
  		this.toolFn();
	},

	scroll:function(){
  		var _this=this;
  		document.onscroll=function(){
  			var scrollTop=document.documentElement.scrollTop||document.body.scrollTop;
  			var scrollLeft=document.documentElement.scrollLeft||document.body.scrollLeft;
  			_this.iCvsLeft=_this.oCanvas.offsetLeft - scrollLeft;
	  		_this.iCvsTop=_this.oCanvas.offsetTop - scrollTop;
  		}
  	},


  	toolFn:function(){
  		var _this=this;
  		var aTool=document.querySelector(".js-tool-lst").children;
  		for(var i=0;i<aTool.length;i++){
			aTool[i].onclick=function(){
				_this.toolChoose(this.getAttribute("data-tool"));
			}
		}
  	},

	toolChoose:function(sTool){
		if(sTool=="eraserAll"){
			this.clearRectAll();
		}else if(sTool=="eraser"){
			this.toolSwitch("pointer",sTool);
			this.clearRect();
		}
	},


	shapeFn:function(){
		var _this=this;
		var aShape=document.querySelector(".js-shape-lst").children;
		for(var i=0;i<aShape.length;i++){
			aShape[i].onclick=function(){
				for(var j=0;j<aShape.length;j++){
					aShape[j].classList.remove("selected");
				}
				this.classList.add("selected");
				_this.shapeChoose(this.getAttribute("data-tool"));
			}
		}
	},

	shapeChoose:function(sShape){
		this.toolSwitch("crosshair",sShape);
		if(sShape=="rect"){
			this.drawRect();
		}else if(sShape=="arc"){
			this.drawArc();
		}else{
			this.drawLine();
		}
	},

	colorFn:function(){
		var _this=this;
		var aColor=document.querySelector(".js-color-lst").children;
		for(var i=0;i<aColor.length;i++){
			aColor[i].onclick=function(){
				for(var j=0;j<aColor.length;j++){
					aColor[j].classList.remove("selected");
				}
				this.classList.add("selected");
				_this.colorChoose(this.getAttribute("data-color"));
			}
		}
	},

	colorChoose:function(sColor){
		this.sColor=sColor?sColor:"#000";
		this.oCxt.strokeStyle=this.sColor;
	},

	lineWidthFn:function(){
		var _this=this;
		var aLineWidth=document.querySelector(".js-line-width-lst").children;
		for(var i=0;i<aLineWidth.length;i++){
			aLineWidth[i].onclick=function(){
				for(var j=0;j<aLineWidth.length;j++){
					aLineWidth[j].classList.remove("selected");
				}
				this.classList.add("selected");
				_this.lineWidthChoose(this.getAttribute("data-lineWidth"));
			}
		}
	},

	lineWidthChoose:function(iLineWidth){
		this.iLineWidth=iLineWidth?iLineWidth:1;
		this.oCxt.lineWidth=this.iLineWidth;
	},

	virtualCanvasCreate:function(){
		var vCs=this.oCanvas.cloneNode(true);
		vCs.id="virtualCanvas";
		vCs.style.background="transparent";
		vCs.style.boxShadow="none";
		vCs.style.position="absolute";
		vCs.style.left=this.oCanvas.offsetLeft+"px";
		vCs.style.top=this.oCanvas.offsetTop+"px";
		var vCxt=vCs.getContext("2d");
		document.querySelector("body").appendChild(vCs);
		return {
			vCanvas:vCs,
			vCxt:vCxt
		}
	},

	virtualCanvasRemove:function(vCs){
		document.querySelector("body").removeChild(vCs);
	},

  	drawLine:function(){
  		var _this=this;
  		this.oCanvas.onmousedown=function(event){
	        var oEvent=event||window.event;
	        var startX=oEvent.clientX-_this.iCvsLeft;
	        var startY=oEvent.clientY-_this.iCvsTop;
	        var endX=startX;
	        var endY=startY;

	        _this.oCxt.beginPath();
	        _this.oCxt.moveTo(startX,startY);

	        document.onmousemove=function(event){
	          var oEvent=event||window.event;
	          endX=oEvent.clientX-_this.iCvsLeft;
	          endY=oEvent.clientY-_this.iCvsTop;

	          _this.oCxt.lineTo(endX,endY);
	          _this.oCxt.stroke();

	          return false;
	        }
	        document.onmouseup=function(){
	          document.onmousemove=null;
	          document.onmouseup=null;
	        }
	    }
  	},

  	drawRect:function(){
  		var _this=this;
  		this.oCanvas.onmousedown=function(event){
  			var oEvent=event||window.event;
  			var startX=oEvent.clientX-_this.iCvsLeft;
	        var startY=oEvent.clientY-_this.iCvsTop;
	        var endX=startX;
	        var endY=startY;

	        var virtualCanvas=_this.virtualCanvasCreate();
  			virtualCanvas.vCxt.strokeStyle=_this.sColor;
  			virtualCanvas.vCxt.lineWidth=_this.iLineWidth;
  			var delta=0;
	        if(_this.iLineWidth%2==1){
        		delta=.5;
            }

	        document.onmousemove=function(event){
	          var oEvent=event||window.event;
	          endX=oEvent.clientX-_this.iCvsLeft;
	          endY=oEvent.clientY-_this.iCvsTop;
	          
	          virtualCanvas.vCxt.clearRect(0,0,virtualCanvas.vCanvas.width,virtualCanvas.vCanvas.height);  //清除虚拟canvas
	          virtualCanvas.vCxt.strokeRect(startX+delta,startY+delta,endX-startX,endY-startY);   //在虚拟canvas上绘制

	          return false;
	        }
	        document.onmouseup=function(){
	          if(endX-startX!=0&&endY-startY!=0){
	          	_this.oCxt.strokeRect(startX+delta,startY+delta,endX-startX,endY-startY);  //鼠标松开在真实canvas上绘制
	          }
	          _this.virtualCanvasRemove(virtualCanvas.vCanvas);

	          document.onmousemove=null;
	          document.onmouseup=null;
	        }
  		}
  	},

  	drawArc:function(){
  		var _this=this;
  		this.oCanvas.onmousedown=function(event){
  			var oEvent=event||window.event;
  			var startX=oEvent.clientX-_this.iCvsLeft;
	        var startY=oEvent.clientY-_this.iCvsTop;
	        var endX=startX;
	        var endY=startY;
	        var disX,disY,radius,coordsX,coordsY;

	        var virtualCanvas=_this.virtualCanvasCreate();
  			virtualCanvas.vCxt.strokeStyle=_this.sColor;
  			virtualCanvas.vCxt.lineWidth=_this.iLineWidth;
  			
	        document.onmousemove=function(event){
	          var oEvent=event||window.event;
	          endX=oEvent.clientX-_this.iCvsLeft;
	          endY=oEvent.clientY-_this.iCvsTop;
	          disX=(endX-startX)/2;
	          disY=(endY-startY)/2;
        	  radius=Math.min(Math.abs(disX),Math.abs(disY));
        	  coordsX=disX < 0 ? -radius : radius;
        	  coordsY=disY < 0 ? -radius : radius;
	          
	          virtualCanvas.vCxt.clearRect(0,0,virtualCanvas.vCanvas.width,virtualCanvas.vCanvas.height);  //清除虚拟canvas
	          virtualCanvas.vCxt.beginPath();
	          virtualCanvas.vCxt.arc(startX+coordsX,startY+coordsY,radius,0,2*Math.PI,false);   //在虚拟canvas上绘制
	          virtualCanvas.vCxt.stroke();

	          return false;
	        }
	        document.onmouseup=function(){
	          if(endX-startX!=0&&endY-startY!=0){
	          	_this.oCxt.beginPath();
	          	_this.oCxt.arc(startX+coordsX,startY+coordsY,radius,0,2*Math.PI,false); //鼠标松开在真实canvas上绘制
	          	_this.oCxt.stroke();
	          }
	          _this.virtualCanvasRemove(virtualCanvas.vCanvas);

	          document.onmousemove=null;
	          document.onmouseup=null;
	        }
  		}
  	},


  	toolSwitch:function(sCursorStyle,sTool){
  		this.oCanvas.style="cursor:"+sCursorStyle;
  	},

  	clearRectAll:function(){
  		this.oCxt.clearRect(0,0,this.oCanvas.width,this.oCanvas.height);
  	}
}