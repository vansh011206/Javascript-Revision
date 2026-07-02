for(let i=1; i<=3;i++){

    for(let j=i;j<=3;j++){
        console.log(j);
    }
}

for(let i = 1; i <= 3; i++) {

    let row = "";

    for(let j = 1; j <= 3; j++) {
        row += j;
    }

    console.log(row);

}


1
12
123
1234
12345

for(let i=1; i<=5;i++){
      row = "";
      for(let j=1; j<=i; j++){
          row += j;
      }
      console.log(row);
}

54321
5432
543
54
5
for(let i=5; i>=1;i--){
      row = "";
      for(let j=5; j>=i; j--){
          row += j
      }
      console.log(row);
}


const positive = (num) => {
    if(num < 0){
        console.log("Negative")
    }
    else if(num === 0 ){
        console.log("Zero")
    }
    else{
        console.log("Positive")
    }
}

positive(10);
positive(-5);