// 1
[10,20,30]

// 2
5

// 3
10
[20,30]

// 4
// Vanshaj
// {
//     age: 20,
//     city: "Delhi"
// }

// 5
function print(...arr) {
  console.log(arr)
}

print(5,10,15);

// 6
60

// 7
95
[90,85,80]

// 8
// {
//   name: "Rahul",
//   city: "Delhi"
// }

// 9
let colors = ["Red","Green","Blue","Yellow"];

let[firstColor ,...remainingColors] = colors;

// 10
const laptop = {
    brand: "Dell",
    ram: "16GB",
    price: 70000
};

const { 
  brand,
  ...details
 } = laptop

//  11
10
20
[30,40,50]

// // 12
// let [...rest, last] = [1,2,3]; - valid h kyunki ye 30 ko last m store krdega and [10,20 ] rest

// 13
function demo(...nums, a) {
// - valid h isme hum nums ko ek array pass kar skte hn and a ko ek string ya number
} 
// 14
// let [first, ...rest] = arr; - ye array destructing h 
// const { name, ...others } = student; - ye object destructing h 
// 15

// - rest operator use karke hum sereate value ko array m tod skye hn 
// - agar infitie value ek saath aa jaayen toh function m input dena mushkil bekar hota h or syntax accha ni dikhta
// - yeh ES6 feature h mtlb new and updates

//bonus
1
2
[3,4,5]


