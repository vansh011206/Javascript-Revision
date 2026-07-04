// 1
const student = {
    Name : "Vanshaj",
    Age : 20,
    City : "Delhi"
}

// 2
Vanshaj

// 3
Delhi

// 4.
student[Age] = 21

// 5
student[College] = YMCA

// 6
BMW
X5

// 7
{ name: 'Rahul' }

// 8
undefined

// 9

for( let key in student ){
    console.log(key)
}


// 10
for (let key in student){
    console(` ${key} ${student[key]}`)
}
// 11
// student.name - jab hume koi value extract karni ho oject m se toh hum ise use karte h 
// student["name"] -  jab hume koi value extract ya modify ya add karni hoti h toh hum iska use karte h 

// 12
Delhi

// 13

let person = {
    name: "Vanshaj"
};
function greet(){
    console.log(`Hello ${person.name}`)
}

// 14
for(let key in student){
    (key == "city") ? "Present" : "NOT-Present";
}

// 15
// Object - values ko store karta h key value pairs m 
// for ex - student ka complete data/ information 
let x = {
    a : "b"
}

// Array - values ko store karta h continues and value form m ... 
// for ex - student ke ek particular subject m marks 
let x = ["b"] 