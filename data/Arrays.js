// 1
let fruits = ["Apple","Banana","Mango","Orange"];

// 2
console.log(fruits[0]); -- Apple
console.log(fruits[2]); -- Mango

// 3
4

// 4
fruits[1] = "Grapes"

// 5
10

// 6
["Apple","Banana","Orange"]

// 7
["Apple","Banana"]

// 8
[5,10,20,30]

// 9
[20,30];

// 10
let marks = [75,80,90,95];
for(let i=0 ; i<= marks.length;i++){
    console.log(marks[i])
}

// 11
[10,20,30]

// 12
3

// 13
let nums = [2,4,6,8,10];
let sum = 0;
for(let i=0 ; i<= nums.length;i++){
    sum = sum + i
}
console.log(sum)

// 14
let names = ["Aman","Vanshaj","Rahul"];
for (let name of names) {
  if(name === "Vanshaj"){
    console.log("Present")
  }
}

// 15
// push(x) --  ye last place pe insert karta hn array m passed element(x) ko
// pop() -- ye last element ko nikal deta h array se 
// unshift(x) -- ye first element ko nikal deta h araay se 
// shift() -- ye first place pe insert karta hn array m passed element(x) ko 


// 16
let arr = [1,2];

arr.push(3);

arr.push(4);

arr.pop();

console.log(arr);

-- [1,2,3]

