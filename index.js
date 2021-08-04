class Slider {
  constructor(options) {
    this.options = options
    
    this.$slider = document.querySelector(options.selector)
    this.$container = this.$slider.querySelector('[data-slider-container]')
    this.$slides = this.$slider.querySelectorAll('[data-slide]')
    this.$buttons = this.$slider.querySelectorAll('[data-button]')
    this.$dots = this.$slider.querySelector('[data-dots]')
    
    this.currentSlideIndex = 0
    
    this.slideWidth = this.$slider.querySelector('[data-slide]').getBoundingClientRect().width
    this.init()
  }
  
  init() {
    this.swipeSlide()
    
    if (this.options.buttons) {
      if (!this.$buttons || !this.$buttons[1]) {
        this.createButtons()
      } else {
        this.buttonsListener()
      }
    } else if (this.$buttons) {
      this.$buttons.forEach($button => {
        $button.parentNode.removeChild($button)
      })
    }
    
    if (this.options.dots) {
      if (!this.$dots) {
        this.createDots()
      } else {
        this.dotsListener()
      }
    }
    
    if (this.options.autoplay) {
      let speed = this.options.autoplaySpeed || 3000
      if (speed < 500) {
        speed = 500
      }
      this.startAutoplay(speed)
    }
  }
  
  createButtons() {
    // метод, котый создает кнопки "вперед" и "назад"
    // если мы не прописали их в html
    
    this.$slider.insertAdjacentHTML('beforeend', `
      <button class="slider-button" data-button data-button-prev="button">
        prev
      </button>
      <button class="slider-button" data-button data-button-next="button">
        next
      </button>
    `)
    this.$buttons = this.$slider.querySelectorAll('[data-button]')
    this.buttonsListener()
  }
  
  createDots() {
    // метод, котый создает кнопки пагинации
    // если мы не прописали их в html
    const createDotsButtons = () => {
      const $buttons = []
      this.$slides.forEach((_, index) => {
        $buttons.push(`<button data-dot="${index + 1}">${index + 1}</button>`)
      })
      
      return $buttons.join('')
    }
    this.$slider.insertAdjacentHTML('beforeend', `
      <div class="slider-dots" data-dots>
        ${createDotsButtons()}
      </div>
    `)
    this.$dots = this.$slider.querySelector('[data-dots]')
    this.dotsListener()
  }
  
  dotsListener() {
    // слушатель событий на кнопках пагинации
    this.$dots.addEventListener('click', event => {
      this.currentSlideIndex = (+event.target.dataset.dot) - 1
      this.$container.style.transform = `translateX(${this.slideWidth * -this.currentSlideIndex}px)`
      
      this.activeElements()
    })
  }
  
  buttonsListener() {
    // слушатель событий на кнопках "вперед" "назад"
    this.$buttons.forEach($button => {
      $button.addEventListener('click', event => {
        const $nextButton = event.target.closest('[data-button-next]')
        const $prevButton = event.target.closest('[data-button-prev]')
        
        if ($nextButton) {
          this.changeSlide('next')
        } else if ($prevButton) {
          this.changeSlide('prev')
        }
      })
    })
  }
  
  swipeSlide() {
    // метод, который позволяет "свайпнуть" слайд пальцем
    // работает только на сенсорных экранах  т.е на телефонах, как было указано в т.з
    // в этом методе можно добавить слушатели мыши, т.к код останется почти тот же
    
    this.$slider.addEventListener('touchstart', event => {
      let $slide = event.target.closest('[data-slide]')
      if ($slide) {
        
        const coords = $slide.getBoundingClientRect()
        let delta
        let startMovement = Math.round(event.touches[0].pageX - coords.right) + (this.slideWidth * this.currentSlideIndex)
        
        this.$container.ontouchmove = e => {
          delta = (Math.round(e.touches[0].pageX - coords.right) - startMovement)
          this.$container.style.transform = `translateX(${delta}px)`;
          this.$container.style.transition = `.0s`;
        }
        this.$container.ontouchend = e => {
          this.$slider.ontouchmove = null
          this.$slider.ontouchend = null
          
          let trueDelta = (this.slideWidth / 3) + (this.slideWidth * this.currentSlideIndex)
          this.$container.style.transition = `.3s`;
          
          if (-delta > trueDelta) {
            this.changeSlide('next')
          } else if ((delta + (this.slideWidth * this.currentSlideIndex)) > this.slideWidth / 3) {
            this.changeSlide('prev')
          }
          delta = this.slideWidth * -this.currentSlideIndex
          this.$container.style.transform = `translateX(${delta}px)`;
        }
      }
    })
    
    this.activeElements()
  }
  
  changeSlide(type) {
    // дефолтный метод, который можно исользовать в любой ситуации
    // он будет перелистывать слайд вперед, если передать в него 'next'
    // и назад, если передать в него 'prev'
    if (type === 'next') {
      if (this.currentSlideIndex >= (this.$slides.length - 1)) {
        this.currentSlideIndex = -1
      }
      this.currentSlideIndex++
      this.$container.style.transform = `translateX(${this.slideWidth * -this.currentSlideIndex}px)`
    } else if (type === 'prev') {
      if (this.currentSlideIndex <= 0) {
        this.currentSlideIndex = this.$slides.length - 1
        this.$container.style.transform = `translateX(${this.slideWidth * -this.currentSlideIndex}px)`
      } else {
        this.currentSlideIndex--
        this.$container.style.transform = `translateX(${this.slideWidth * -this.currentSlideIndex}px)`
      }
    }
    
    this.activeElements()
  }
  
  startAutoplay(speed) {
    // автоматическая работа слайдера
    setInterval(() => {
      setTimeout(() => {
        this.changeSlide('next')
      }, speed);
    }, speed)
  }
  
  activeElements() {
    // метод добавления класса 'slide-active' активным элементам слайдера (активному слайду и aктивной кнопке (dot))
    const $slide = this.$slider.querySelector(`[data-slide="${this.currentSlideIndex + 1}"]`)
    const $dot = this.$slider.querySelector(`[data-dot="${this.currentSlideIndex + 1}"]`)
    
    const removeActiveSlides = $elements => {
      $elements.forEach($el => {
        $el.classList.remove('slide-active')
      })
    }
    
    if ($slide) {
      removeActiveSlides(this.$slides)
      $slide.classList.add('slide-active')
    } 
    if ($dot) {
      const $dotsArray = this.$dots.querySelectorAll(`[data-dot]`)
      
      removeActiveSlides($dotsArray)
      $dot.classList.add('slide-active')
    }
  }
}

new Slider({
  // тут все настройки, которые поддерживает слайдер
  selector: '[data-slider]',
  buttons: true,
  autoplay: true,
  autoplaySpeed: 4000,
  dots: true
})