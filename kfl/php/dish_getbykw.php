<?php
    header("Content-Type:application/json;CHARSET=UTF8");
    $kw=$_REQUEST['kw'];
    if(empty($kw)){
        echo '[]';
        return;
    }
    require('init.php');
    $sql="SELECT did,price,img_sm,material,name FROM kf_dish WHERE name like '%$kw%' or material like '%$kw%'";
    $result=mysqli_query($conn,$sql);
        $output=[];
        while(true){
        $rows = mysqli_fetch_all($result,MYSQLI_ASSOC);
        if(!$rows){
            break;
         }
         $output=$rows;
      }
        echo json_encode($output);
?>