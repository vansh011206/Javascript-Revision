// 1
1
2
3
4
5

// 2
5
4
3
2
1

// 3
for (let i = 1; i <= 10; i++) {
    console.log(i);
}

// 4
for(let i = 1; i <= 10; i++){
    console.log(i*2);
}

// 5
1
2
3

// 6
5
4
3
2
1

// 7
1
2
3

// 8
1
2
3
4
5

// 9
1
2
4
5

// 10
let n = 10;

while(n>=1){
    console.log(n);
    n--;
}

// 11
let sum = 0;
for(let i = 1; i <= 10; i++){
    sum = sum + i;
}
console.log(sum);

// 12
let num = 5;
let factorial = 1;
if (num == 0 || num == 1){
    factorial = 1;
}
else if (num<0){
    console.log("Factorial is not defined for negative numbers.");

}
else {   
    for(let i = num;i>=1;i--){
        factorial = factorial * i;
    }
}

console.log(`Factorial of ${num} is ${factorial}.`);

// (iska for loop se koi or tarika h toh batana)

// 13, 14
// nested loops samjh ni aate 


// 15 
let sum=0;

for(let i=1;i<=5;i++){

    sum+=i;

}

console.log(sum);

answer = 15

1
3
6
10
15

// (har iteration pe sum ka value print karna h toh console.log(sum) ko for loop ke andar likhna h)

for (let i=1;i<=30;i++){
    if (i%3==0){
        console.log(`${i}`);
    }
}

// 14
for(let i=1;i<=5;i++){

    let star="";

    for(let j=1;j<=i;j++){
        star+="*";
    }
    console.log(star);
}
