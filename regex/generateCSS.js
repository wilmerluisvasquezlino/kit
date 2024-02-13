const css = {
  style: [],
  add(array,callback){
    array.forEach(e => {
      this.style.push(callback(e))
      
    });
  },
  addRange(min,max,callback){
    for (let min = 0; min <= max; min++) {
      this.style.push(callback(min))
    }
  }
}

css.addRange(0,20,(i)=>{
  return `.p-${i}{padding: ${i}px}`
})
css.addRange(0,20,(i)=>{
  return `.pt-${i}{padding-top: ${i}px}`
})
css.addRange(0,20,(i)=>{
  return `.pl-${i}{padding-left: ${i}px}`
})
css.addRange(0,20,(i)=>{
  return `.pb-${i}{padding-bottom: ${i}px}`
})
css.addRange(0,20,(i)=>{
  return `.pr-${i}{padding-rigth: ${i}px}`
})
css.addRange(0,20,(i)=>{
  return `.px-${i}{padding-rigth: ${i}px;padding-left: ${i}px}`
})
css.addRange(0,20,(i)=>{
  return `.py-${i}{padding-top: ${i}px;padding-bottom: ${i}px}`
})
css.addRange(0,20,(i)=>{
  return `.w-${i}{width: ${i}px}`
})
css.add([100,200,300,400,500,600,700,800,900],(i)=>{
  const as = {
    100: "thin",
    200: "extra-light",
    300: "light",
    400: "regular",
    500: "medium",
    600: "semi-bold",
    700: "bold",
    800: "extra-bold",
    900: "black",
  }
  return `.font-${as[i]}{font-weigth: ${i}}}`
})
console.log(css.style.join("\n"));

const g = "md_w-2 itemCenter"