
// 1
const student = {
    name: "Vanshaj",
    age: 20,
    city: "Delhi"
};

const {name, age} = student;
console.log(name);
console.log(age);

// 2
// Rahul

// 3
// X5

// 4
const person = {
    name: "Aman"
};
const {age: personAge = 18} = person;
console.log(personAge)

// 5
// Delhi

// 6
const { name: studentName } = student 
console.log(studentName)

// 7
// abc@gmail.com
// 20

// 8
// Delhi

// 9

const book = {
    title: "JavaScript",
    price: 499
};
const {title, price} = book;
console.log(title)
console.log(price)

// 10
30

// 11
const studentDetail = {
    name: "Vanshaj",
    address: {
        city: "Delhi",
        pin: 121001
    }
};

const{address:{city}} = studentDetail;
console.log(city)

// 12
20

// 13
// Rahul
// Noida

// 14
// const { name } = student; - isme simply name ek variable ban jaaega 
// const { name: studentName } = student; -  isme name ka naam change hoga studentName me and vo ek variable ban jaega 


// 15
// Object Destructuring ke 3 advantages likho.

// - repeat karke hum baar baar student. aise nhi likhna padhta console pe
// - easy ko apply hota h 
// - new feacture h 

const laptop = {
    brand: "Dell",
    ram: "16GB",
    price: 70000
};

console.log(({brand}=laptop),({price}=laptop))

