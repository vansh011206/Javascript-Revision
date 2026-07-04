// 1
function hello(){
    console.log("Hello World");
}
hello();

// 2
Hello
Hello

// 3
function welcome(){
    console.log("Welcome Vanshaj");
}
welcome();

// 4
30

// 5
// pehle m vo function kko create kar raha h 
// doosre m vo function ko call kar raha h

// 6
function greet(name){
    console.log(`Hello ${name}`);
}
greet("Vanshaj");

// 7

function sqaure(num){
    return num * num;
}
console.log(sqaure(5));

// 8
30

// 9
// Hello Rahul
// Hello Vanshaj

// 10
function student(name, age, city){
    console.log(`name: ${name}
                 age: ${age}
                 city: ${city}`);
}

student("Vanshaj", 20, "Delhi");

// 11
// console.log value ko print karata h 
// return value ko return karata h function k bahar use karne k liye (return pe function khatam ho jata h)

// 12
30

// 13
function isEven(num){
    if(num % 2 === 0){
        return true;
    }
    return false;
}
if(isEven(10)){
    console.log("Even");
}
else if(isEven(7)){
    console.log("Odd");
}
else{
    console.log("number not asked in question");
}

// 14
function largest(f, s){
    if(f>s){
        console.log("f is greater than s");
    }
    else if(s>f){
        console.log("s is greater than f");
    }
    else{
        console.log("f is equal to s");
    }
}
largest(10, 25);

// 15
// 1. function declaration m function ko declare karte h ki function ka ye naam h 
// 2. function expression m function ko variable m assign karte hn 
// 3. arrow function m function ko arrow ke sath likhte h for ex : hello = ()=>{}

// bonus
function factorial(num){
    if(num === 0 || num === 1){
        return 1;
    }
    return num * factorial(num - 1);
}

console.log(factorial(5));