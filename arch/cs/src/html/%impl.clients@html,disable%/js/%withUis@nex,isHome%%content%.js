window.onload = function() {
    with(document.body) {
      oncontextmenu=function(){return false}
      ondragstart=function(){return false}
      onselectstart=function(){return false}
      onbeforecopy=function(){return false}
      onselect=function(){document.selection.empty()}
      oncopy=function(){document.selection.empty()}
    }
}
