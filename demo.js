$(window).load(function(){
	//初始化
	var gameNum = 0;//第一关
	var gameNumMax = 3;//图片关数
	var cutNum = 3;//行和列切分的块数
	var $imgbox = $('.imgbox');
	var imgboxW = $imgbox.width();
	var imgboxH = $imgbox.height();
	var boxW,boxH;
	var hasStart = false;
	var $box=null;
	var origArr = new Array ();
	
	createGame();
	function createGame(){
		$imgbox.html('');
		origArr.length = 0;
		boxW = imgboxW/cutNum;
		boxH = imgboxH/cutNum;
		var $boxCell='';
		for( var i=0; i<cutNum ; i++){	
			for(var j = 0; j<cutNum; j++){
				$boxCell = $('<div class="box">'+'</div>');	
				$boxCell.css({
					'width': boxW + 'px',
					'height': boxH + 'px',
					'background-position': -j*boxW + 'px ' + (-i*boxH) + 'px',
					'top' : i*boxH + 'px',
					'left' : j*boxW + 'px'
				});
				$boxCell.appendTo($imgbox);
				origArr.push( i*cutNum+j );
			}
		}
		$box = $('.box');
		$box.css('background-image','url(images/'+gameNum+'.jpg)');
	}

	//点击开始按钮，打乱图片顺序，启动图片点击移动功能，启动返回和看原图功能
	var $btnStart = $('.start');
	var $btnOrign = $('.orign');
	var $btnNext = $('.next');
	var isOrign = true;
	$btnStart.click( function(){
		if (!hasStart) {
			hasStart = true;
			$(this).text('重玩');
			$box.css('cursor','move').on('mousedown',boxMove);
			$btnOrign.addClass('on').on('click',toggleOrign);
		}
		if(!isOrign){
			$btnOrign.text('原图');
			isOrign = true;
		}
		randomImg();

		//切换“查看原图”和“返回”功能
		function toggleOrign(){
			$this = $(this);
			if(isOrign){
				$this.text('返回');
				setImgOrder(origArr);
			}else{
				$this.text('原图');
				setImgOrder(randomArr);
			}
			isOrign = !isOrign;
		}
	} );

	//重置图片顺序
	var randomArr = new Array ();//randomArr[0]存放了第0个box的实际位置，以此类推
	function randomImg(){
		var len = origArr.length;
		var random;
		randomArr.length = 0;
		for(var i=0;i<len;i++){
			do{
				random = Math.floor( Math.random()*len );
			}while( $.inArray(random,randomArr) >=0 )
			randomArr.push( random );
		}
		setImgOrder( randomArr );
	}

	//按照顺序排列图片
	function setImgOrder(arr){
		var len = arr.length;
		var i = num = 0;
		while( i< len ){
			num = arr[i];
			$box.eq(i).animate({
				'left': num % cutNum * boxW +'px',
				'top': Math.floor( num/cutNum )* boxH +'px'
			},200);
			i++;
		}
	}

	//图片移动
	function boxMove(e){
		var $this = $(this);
		$this.css('z-index','40');
		var orign = $this.offset();
		var disX = e.pageX - orign.left;
		var disY = e.pageY - orign.top;
		var index = $this.index();
		$(window).on('mousemove',function(e1){
			e1.preventDefault();
			$this.offset({ top : e1.pageY - disY , left : e1.pageX - disX });
		}).on('mouseup',function(e2){
			$(window).off('mousemove').off('mouseup');
			var imgboxOffset = $imgbox.offset();
			placeCheck( e2.pageX-imgboxOffset.left , e2.pageY-imgboxOffset.top , index );
		})
	}

	//判断图片位置，确定进一步操作
	function placeCheck(pX,pY,index){
		var $this = $box.eq(index);
		var oldPlace = randomArr[ index ];
		if( pY < 0 || pY > imgboxH || pX < 0 || pX > imgboxW  ){
			//超出范围，回到原位
			$this.animate({
				'top' : Math.floor( oldPlace/cutNum ) * boxH +'px',
				'left' : oldPlace % cutNum * boxW + 'px'
			},400,function(){
				$this.css('z-index','10');
			});
		}else{
			//做替换
			var y = Math.floor( pY / boxH );
			var x = Math.floor( pX / boxW );
			$this.animate({
				'top' : y*boxH +'px',
				'left' : x*boxW+'px'
			},400);
			var newPlace = cutNum*y + x;
			var replaceOne = randomArr.indexOf( newPlace ) ;
			$box.eq( replaceOne ).css('z-index','20').animate({
				'top' : Math.floor( oldPlace /cutNum ) * boxH +'px',
				'left' : oldPlace % cutNum * boxW +'px'
			},400,function(){
				$(this).css('z-index','10');
				$this.css('z-index','10');
				randomArr[ index ] = newPlace;
				randomArr[ replaceOne ] = oldPlace;
				correctCheck();
			});	
		}
	}

	//判断是否正确
	function correctCheck(){
		var isCorrect = true;
		var len = randomArr.length;
		for(var i=0; i<len; i++){
			if(randomArr[i] != i){
				isCorrect = false;
				break;
			}
		}
		if( isCorrect == true ){
			$btnOrign.removeClass('on').off('click');
			hasStart = false;
			$box.css('cursor','default').off('mousedown');
			//判断启动“下一关”功能
			if (gameNum == gameNumMax-1) {
				alert('恭喜你，已完成所有挑战！');
			}else{
				alert('太棒了！')
				$btnNext.addClass('on').on('click',nextGame);
			}
		}
	}

	//下一关
	function nextGame(){
		gameNum++;
		cutNum++;
		createGame();
		$(this).removeClass('on').off('click');
		$btnStart.text('开始');
		if (hasStart) {
			hasStart = false;
		}
		if(!isOrign){
			$btnOrign.text('原图');
			$btnOrign.removeClass('on').off('click');
			isOrign = true;
		}
	}
})