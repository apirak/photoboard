/*
 *	Copyright (c) 2008, Thomas L. Robinson
 *	
 *	All rights reserved.
 *	
 *	Redistribution and use in source and binary forms, with or without
 *	modification, are permitted provided that the following conditions
 *	are met:
 *	
 *	Redistributions of source code must retain the above copyright
 *	notice, this list of conditions and the following disclaimer.
 *	Redistributions in binary form must reproduce the above copyright
 *	notice, this list of conditions and the following disclaimer in the
 *	documentation and/or other materials provided with the distribution.
 *	Neither the name of the tlrobinson.net nor the names of its contributors
 *	may be used to endorse or promote products derived from this software
 *	without specific prior written permission.
 *	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *	"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *	LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 *	A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *	CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *	EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *	PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *	PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *	LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *	NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

function hasClass(ele,cls) {
	if (ele.className != null) {
		return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
	}else{
		return false
	}
}

		var zIndexCount = 1;
		var moving = {};
		function touchHandler(e) {
			if (e.type == "touchstart") {
				for (var i = 0; i < e.touches.length; i++) {
					
					var movableTarget = getMovableTarget(e.touches[i].target);
				    // for each "movable" touch event:
  				//alert("x:"+e.touches[i].target)
					//console.log("touch classname: " + e.touches[i].target.className + " id:" + e.touches[i].target.id);
					//console.log("movable classname: " + movableTarget.className);
					//console.log("touch identifier: " + e.touches[i].identifier);
					//console.log("movable value:" + movableTarget.xfmTX);
					
					if (hasClass(movableTarget, "movable")) {
						
						var id = e.touches[i].identifier;
						
						// record initial data in the "moving" hash
						moving[id] = {
							identifier: id,
							target:   	movableTarget,
							mouse:		{ x: e.touches[i].clientX, y: e.touches[i].clientY },
							position:	{ x: movableTarget.xfmTX, y: movableTarget.xfmTY },
							rotation: 	movableTarget.xfmR,
							scale: 		movableTarget.xfmS
						};
						
						// move to the front
						moving[id].target.style.zIndex = zIndexCount++;
						
						// reset rotate/scale mode to off
						moving[id].rotateScaleMode = false;
					}
				}
			}
			else if (e.type == "touchmove") {			
			    // if there are two touchs and both are on the *same* element, we're in rotate/scale mode
				if (e.touches.length == 2 && 
					getMovableTarget(e.touches[0].target) == getMovableTarget(e.touches[1].target)) {
					var idA = e.touches[0].identifier,
						idB = e.touches[1].identifier;
										
					// if we've previously recorded initial rotate/scale mode data:
					if (moving[idA] != null && moving[idA].rotateScaleMode && moving[idB].rotateScaleMode ) {
					    // calculate translation, rotation, and scale
						moving[idA].target.xfmTX = ((moving[idA].positionCenter.x - moving[idA].mouseCenter.x) + ((e.touches[0].clientX + e.touches[1].clientX) / 2));
						moving[idA].target.xfmTY = ((moving[idA].positionCenter.y - moving[idA].mouseCenter.y) + ((e.touches[0].clientY + e.touches[1].clientY) / 2));
						moving[idA].target.xfmR = moving[idA].rotation + e.rotation;
						moving[idA].target.xfmS = moving[idA].scale * e.scale;
						
						updateTransform(moving[idA].target);
					}
					else {
						if (moving[idB] != null) {
							// set rotate/scale mode to on
							moving[idA].rotateScaleMode	= moving[idB].rotateScaleMode	= true;
							// record initial rotate/scale mode data
							moving[idA].mouseCenter		= moving[idB].mouseCenter		= {
								x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
								y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
							}
							moving[idA].positionCenter	= moving[idB].positionCenter	= {
								x: moving[idA].target.xfmTX,
								y: moving[idA].target.xfmTY
							}
						}
					}
				}
				else {
					for (var i = 0; i < e.touches.length; i++) {
						var id = e.touches[i].identifier;
						
						// for each touch event:
						if (moving[id]) {
							// reset rotate/scale mode to off
							moving[id].rotateScaleMode = false;
							// calculate translation, leave rotation and scale alone
							moving[id].target.xfmTX = ((moving[id].position.x - moving[id].mouse.x) + e.touches[i].clientX);
							moving[id].target.xfmTY = ((moving[id].position.y - moving[id].mouse.y) + e.touches[i].clientY);
							updateTransform(moving[id].target);
						}
					}
				}
			}
			else if (e.type == "touchend" || e.type == "touchcancel") {
			    // clear each from the "moving" hash
				for (var i = 0; i < e.touches.length; i++)
					delete moving[e.touches[i].identifier];
			}
			
			e.preventDefault();
		}
		
		// set the transform style property based on xfm element properties
		function updateTransform(element) {
			element.style['-webkit-transform'] =
				'translate('+element.xfmTX+'px,'+element.xfmTY+'px) '+
				'scale('+element.xfmS+') '+
				'rotate('+element.xfmR+'deg)';
		}
		
		function getMovableTarget(element){
			top_element = element;
			while (top_element.id == "") {
				top_element = top_element.parentNode;
			}
			return top_element;
		}