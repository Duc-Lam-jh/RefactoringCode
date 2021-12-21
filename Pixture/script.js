function SetUpCarousel(id){
  const carousel = document.getElementById(id);
  const moving = carousel.querySelector("#moving-container");
  //console.log(moving);

  if(moving.offsetWidth > carousel.offsetWidth){
    moving.style.right = "100px";
    // moving.style.left = "0px";
  }
  SetCarouselControls(carousel);
  DragItem(moving);
  DragItemDesktop(moving);
}

function SetCarouselControls(carousel){
  const moving = carousel.querySelector("#moving-container");
  let difference;
  const leftArrow = carousel.querySelector("#left");
  const rightArrow = carousel.querySelector("#right");

  //console.log(moving.offsetWidth, carousel.offsetWidth);

  if(document.documentElement.clientWidth < 1100){
    leftArrow.style.display = 'none';
    rightArrow.style.display = 'none';
    return;
  }

  if(moving.offsetWidth > carousel.offsetWidth){
    difference = moving.offsetWidth - carousel.offsetWidth;
    const right = parseInt(moving.style.right);
    const left = parseInt(moving.style.left);
    if(right >= 50){
      //show right arrow
      leftArrow.style.display = 'none';
      rightArrow.style.display = 'block';
    }
    if(right < 50 && right >= -(moving.offsetWidth - carousel.offsetWidth)){
      //show both arrows
      leftArrow.style.display = 'block';
      rightArrow.style.display = 'block';
      
    }
    else if(right < -(moving.offsetWidth - carousel.offsetWidth)){
      //show left arrow
      leftArrow.style.display = 'block';
      rightArrow.style.display = 'none';
    }
  }
  else{
    leftArrow.style.display = 'none';
    rightArrow.style.display = 'none';
  }

  //console.log(moving.offsetLeft);

}

function MoveLeft(item){
  const wrapper = item.parentNode.parentNode;
  //console.log(wrapper);
  const moving = wrapper.querySelector("#moving-container");
  
  console.log(moving.style.right);
  moving.style.right = (parseInt(moving.style.right) + 350) + 'px';
  console.log(moving.style.right);

  SetCarouselControls(wrapper.parentNode);
}

function MoveRight(item){
  const wrapper = item.parentNode.parentNode;
  //console.log(wrapper);
  const moving = wrapper.querySelector("#moving-container");
  
  console.log(moving.style.right);
  moving.style.right = (parseInt(moving.style.right) - 350) + 'px';
  console.log(moving.style.right);

  SetCarouselControls(wrapper.parentNode);
}

function DragItem (item) {
	const parent = item.parentElement;
  const carousel = parent.parentElement;

	//set click listener
	item.ontouchstart = function (event) { 
    //turn on mouse down flag
		this.isDown = true;
		//get starting mouse coords
		this.mouseOldX = event.touches[0].clientX;
		//get sizes of element and its parent's
		this.width = this.offsetWidth;
		this.parentWidth = parent.offsetWidth;

		//set starting style if it isnt already a number
		if (isNaN(parseInt(this.style.right))) {
			this.style.right = '100px';
		}
   };

	//set mouse move listener
	item.ontouchmove = function (event) {
		//if mouse down flag is true = mouse is dragging
		if (this.isDown) {
			//calculate the length of mouse's path
      const newX = event.touches[0].clientX;
			const dX = newX - this.mouseOldX;

			//calculate new coords of element
			let newRight = parseInt(this.style.right) - dX;

			//if it's out of bounds horizontally
			if (newRight > 100) {
				newRight = 100;
			}
			else if (newRight < -(this.width - this.parentWidth + 100)) {
				newRight = -(this.width - this.parentWidth);
        newRight -= 100;
			}     
      
			//apply the new position
			this.style.right = newRight + 'px';
      
			//reset the starting mouse coords to the current coords
			this.mouseOldX = event.touches[0].clientX;
      console.log(event.touches);

      SetCarouselControls(carousel);
		}
	};

	//set mouse up listener
	item.ontouchend = function (event) {
		//remove mouse down flag
		this.isDown = false;
	};
}

function DragItemDesktop (item) {
	const parent = item.parentElement;
  const carousel = parent.parentElement;

	//set click listener
	item.onmousedown = function (event) { 
    //turn on mouse down flag
		this.isDown = true;
		//get starting mouse coords
		this.mouseOldX = event.clientX;
		//get sizes of element and its parent's
		this.width = this.offsetWidth;
		this.parentWidth = parent.offsetWidth;

		//set starting style if it isnt already a number
		if (isNaN(parseInt(this.style.right))) {
			this.style.right = '100px';
		}
   };

	//set mouse move listener
	item.onmousemove = function (event) {
		//if mouse down flag is true = mouse is dragging
		if (this.isDown) {
			//calculate the length of mouse's path
      const newX = event.clientX;
			const dX = newX - this.mouseOldX;

			//calculate new coords of element
			let newRight = parseInt(this.style.right) - dX;

			//if it's out of bounds horizontally
			if (newRight > 100) {
				newRight = 100;
			}
			else if (newRight < -(this.width - this.parentWidth + 100)) {
				newRight = -(this.width - this.parentWidth);
        newRight -= 100;
			}
      
			//apply the new position
			this.style.right = newRight + 'px';
      
			//reset the starting mouse coords to the current coords
			this.mouseOldX = event.clientX;
      //console.log(newRight, this.offsetLeft);

      SetCarouselControls(carousel);
      //console.log(newRight);
		}
	};

	//set mouse up listener
	item.onmouseup = function (event) {
		//remove mouse down flag
		this.isDown = false;
	};
}

SetUpCarousel('pics-worth-seeing');
SetUpCarousel('read-more');