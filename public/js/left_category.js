$(function(){
    $(".left_c1").click(() => {
        var data = { roastLevel : $("#left_c1").val()}; 
        alert(data.roastLevel);
        $.ajax({
            url  : "/products/search",
            type : "GET",
            data : data,
            dataType: "json"
        })
        // .then(res => {
        //     console.log(res);
        // })
        .catch(err => {
            console.log(err);
        });
    });

    $(".left_c2").click(() => {
        var data = { roastLevel : "medium roast"}; 
        alert(data.roastLevel);
        $.ajax({
            url  : "/products/search",
            type : "GET",
            data : data,
            dataType: "json"
        })
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        });
    });
});