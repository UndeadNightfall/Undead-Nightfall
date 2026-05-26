// source: inline block 2
function stopTitleEvent(e){
 if(!e)return;
 try{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();}catch(err){}
}
function toggleTitlePanel(e,id){
 stopTitleEvent(e);
 var instructions=document.getElementById("instructions");
 var controls=document.getElementById("controlsPanel");
 var instructionBtn=document.getElementById("showInstructions");
 var controlsBtn=document.getElementById("showControls");
 var resetNotice=document.getElementById("resetNotice");
 var target=document.getElementById(id);
 var shouldShow=target && !target.classList.contains("show");

 if(instructions)instructions.classList.remove("show");
 if(controls)controls.classList.remove("show");
 if(instructionBtn)instructionBtn.textContent="Instructions";
 if(controlsBtn)controlsBtn.textContent="Controls";
 if(resetNotice)resetNotice.classList.remove("show");

 if(shouldShow){
   target.classList.add("show");
   if(id==="instructions"&&instructionBtn)instructionBtn.textContent="Hide Instructions";
   if(id==="controlsPanel"&&controlsBtn)controlsBtn.textContent="Hide Controls";
   try{ if(typeof updateControlButtons==="function") updateControlButtons(); }catch(err){}
 }
 return false;
}
function resetTitleControls(e){
 stopTitleEvent(e);
 try{
   if(typeof defaultControls!=="undefined" && typeof cloneControls==="function"){
     controls=cloneControls(defaultControls);
     if(typeof saveControls==="function")saveControls();
     if(typeof updateControlButtons==="function")updateControlButtons();
   }else{
     localStorage.removeItem("undeadNightfallControlsV1");
     localStorage.removeItem("undeadNightfallControls");
     localStorage.removeItem("undead-nightfall-controls");
   }
 }catch(err){}
 var resetNotice=document.getElementById("resetNotice");
 if(resetNotice){
   resetNotice.classList.add("show");
   setTimeout(function(){resetNotice.classList.remove("show");},1800);
 }
 return false;
}
