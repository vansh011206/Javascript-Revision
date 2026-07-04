// 1
1,1
1,2
1,3
2,1
2,2
2,3

// 2
// 8 times 

// 3
// ***
// ******
// *********

// 4
// *
// **
// ***
// ****

// 5

for(let i=1; i<=5; i++){
    row = "";
    for(let j=1; j<=i; j++){
        row += "*";
    }
    console.log(row);
} 

// 6
// ***
// **
// *

for(let i = 1; i <= 3; i++) {

    let row = "";

    for(let j = 1; j <= 3; j++) {
        row += i;
    }

    console.log(row);

}

// 8
for(let i = 1; i <= 3; i++) {

    let row = "";

    for(let j = 1; j <= 3; j++) {
        row += j;
    }

    console.log(row);

}