// for(let i=1; i<=3;i++){

//     for(let j=i;j<=3;j++){
//         console.log(j);
//     }
// }

// for(let i = 1; i <= 3; i++) {

//     let row = "";

//     for(let j = 1; j <= 3; j++) {
//         row += j;
//     }

//     console.log(row);

// }


// 1
// 12
// 123
// 1234
// 12345

// for(let i=1; i<=5;i++){
//       row = "";
//       for(let j=1; j<=i; j++){
//           row += j;
//       }
//       console.log(row);
// }

// 54321
// 5432
// 543
// 54
// 5
// for(let i=5; i>=1;i--){
//       row = "";
//       for(let j=5; j>=i; j--){
//           row += j
//       }
//       console.log(row);
// }


// const positive = (num) => {
//     if(num < 0){
//         console.log("Negative")
//     }
//     else if(num === 0 ){
//         console.log("Zero")
//     }
//     else{
//         console.log("Positive")
//     }
// }

// positive(10);
// positive(-5);


// let arr = [1, 2, 3, 4, 5];

// splice(startIndex, deleteCount, ...newItems)

// // Remove karna
// arr.splice(1, 2); 
// console.log(arr); // [1, 4, 5]

// Replace karna
// let arr2 = [1, 2, 3];
// arr2.splice(1, 1, "X"); // index 1 pe 1 element remove karo, "X" daalo
// console.log(arr2); // [1, "X", 3]

// // Insert karna (delete count 0)
// let arr3 = [1, 2, 3];
// arr3.splice(1, 0, "A", "B");
// console.log(arr3); // [1, "A", "B", 2, 3]


// console.log(arr)


let arr = ["Hello", "World", "JS"];
let arr2 = [1,2,3,4,5]
// console.log(arr.join()); // "Hello,World,JS" (default comma)
// console.log(arr.join(" ")); // "Hello World JS"
// console.log(arr.join("-")); // "Hello-World-JS"
// console.log(arr.join(""))


let combine=  arr.concat(arr2)
console.log(combine.length)
console.log(combine)


