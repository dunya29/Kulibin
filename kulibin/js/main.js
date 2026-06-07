const overlay = document.querySelector(".overlay")
const header = document.querySelector(".header")
const mobMenu = document.querySelector('.header__mob');
const iconMenu = document.querySelector('.icon-menu');
const modals = document.querySelectorAll(".modal")
const successModal = document.querySelector("#success-modal")
const errorModal = document.querySelector("#error-modal")
let animSpd = 400

let bp = {
    largeDesktop: 1535.98,
    desktop: 1279.98,
    laptop: 1023.98,
    tablet: 767.98,
    phone: 575.98,
    phoneSm: 479.98
}
// === Utils ===
const Utils = {
    init() {
        // Скролл и header
        this.ScrollUtils.init();
        // Модалки
        this.ModalUtils.init();
        // Формы
        this.FormUtils.init();
        // Инициализация свайперов
        this.SwiperUtils.init()
    },
    ScrollUtils: {
        winW: window.innerWidth,
        winH: window.innerHeight,
        resizeTimeout: null,
        init() {
            this.initHeaderHeight()
            this.initCustomScroll()
            this.initScrollHandlers()
        },
        isIOS: (() => {
            const platform = navigator.platform;
            const userAgent = navigator.userAgent;
            return (
                /(iPhone|iPod|iPad)/i.test(platform) ||
                (platform === 'MacIntel' && navigator.maxTouchPoints > 1 && !window.MSStream) ||
                (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)
            );
        })(),
        initHeaderHeight() {
            if (!header) return;
            const updateHeight = () => {
                let height = header.getBoundingClientRect().height;
                document.documentElement.style.setProperty('--header-h', height + 'px');
            };
            const resizeObserver = new ResizeObserver(updateHeight);
            resizeObserver.observe(header);
        },
        initCustomScroll() {
            const customScroll = document.querySelectorAll(".custom-scroll");
            const isFirefox = typeof InstallTrigger !== 'undefined';
            if (!isFirefox || !customScroll.length) return;

            document.documentElement.style.scrollbarWidth = "thin";
            document.documentElement.style.scrollbarColor = "#1a1a1a transparent";
            customScroll.forEach(item => { item.style.scrollbarWidth = "thin"; item.style.scrollbarColor = "#1a1a1a transparent" });

        },
        initScrollHandlers() {
            let lastScroll = this.scrollPos();
            window.addEventListener("scroll", () => {
                let currentScroll = this.scrollPos();
                this.handleHeaderScroll(currentScroll, lastScroll);
                lastScroll = currentScroll;
            });
            window.addEventListener("resize", () => {
                clearTimeout(this.resizeTimeout)
                this.resizeTimeout = setTimeout(() => {
                    this.winW = window.innerWidth
                    this.winH = window.innerHeight
                }, 300);
            });
        },
        handleHeaderScroll(currentScroll, lastScroll) {
            if (!header) return
            if (currentScroll > 1) {
                header.classList.add("scroll");
                if (currentScroll > lastScroll && currentScroll > 150 && !header.classList.contains("unshow")) {
                    header.classList.add("unshow");
                } else if (currentScroll < lastScroll && header.classList.contains("unshow")) {
                    header.classList.remove("unshow");
                }
            } else {
                header.classList.remove("scroll");
                header.classList.remove("unshow");
            }
        },
        scrollPos() {
            return window.scrollY || window.pageYOffset || document.documentElement.scrollTop
        },
        disable() {
            if (!document.querySelector(".modal.open")) {
                const paddingValue = window.innerWidth > 350 ? window.innerWidth - document.documentElement.clientWidth + 'px' : '0px';
                document.querySelectorAll(".fixed-block").forEach(block => block.style.paddingRight = paddingValue);
                document.body.style.paddingRight = paddingValue;
                document.body.classList.add("no-scroll");

                if (this.isIOS) {
                    const scrollY = window.scrollY;
                    document.body.style.position = 'fixed';
                    document.body.style.width = '100%';
                    document.body.style.top = `-${scrollY}px`;
                    document.body.dataset.scrollY = scrollY;
                }
            }
        },
        enable() {
            if (!document.querySelector(".modal.open")) {
                document.querySelectorAll(".fixed-block").forEach(block => block.style.paddingRight = '0px');
                document.body.style.paddingRight = '0px';
                document.body.classList.remove("no-scroll");

                if (this.isIOS) {
                    document.body.style.position = '';
                    document.body.style.top = '';
                    document.body.style.width = '';
                    const scrollY = parseInt(document.body.dataset.scrollY || '0');
                    window.scrollTo(0, scrollY);
                }
            }
        },
        smoothScrollTo(dest) {
            let destPos = dest.getBoundingClientRect().top < 0 ? dest.getBoundingClientRect().top - header.clientHeight - 10 : dest.getBoundingClientRect().top - 10
            if (iconMenu.classList.contains("active")) {
                iconMenu.click()
                setTimeout(() => {
                    window.scrollTo({ top: Utils.ScrollUtils.scrollPos() + destPos, behavior: 'smooth' })
                }, 300);
            } else {
                window.scrollTo({ top: Utils.ScrollUtils.scrollPos() + destPos, behavior: 'smooth' })
            }
        }
    },
    ModalUtils: {
        lastFocusedEl: null,
        _focusHandler: null,
        _escInited: false,
        init() {
            this.initModalClicks()
            this.initEscClose()
            this.modalShowBtns()
            this.modalUnshowBtns()
        },
        initModalClicks() {
            modals.forEach(mod => {
                mod.addEventListener("click", (e) => {
                    if (!mod.querySelector(".modal__content").contains(e.target)) {
                        this.closeModal(mod)
                    }
                })
                // кнопки закрытия внутри модалки
                mod.querySelectorAll(".modal__close").forEach(btn => {
                    btn.addEventListener("click", () => {
                        this.closeModal(mod)
                    })
                })
            })
        },
        initEscClose() {
            if (this._escInited) return
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    const modals = document.querySelectorAll(".modal.open")
                    const topModal = modals[modals.length - 1]
                    if (topModal) {
                        this.closeModal(topModal)
                    }
                }
            })
            this._escInited = true
        },
        modalShowBtns() {
            const modOpenBtn = document.querySelectorAll(".mod-open-btn")
            if (modOpenBtn.length) {
                modOpenBtn.forEach(btn => {
                    btn.addEventListener("click", e => {
                        e.preventDefault()
                        let href = btn.getAttribute("data-modal")
                        this.openModal(document.getElementById(href))
                    })
                })
            }
        },
        modalUnshowBtns() {
            const modCloseBtn = document.querySelectorAll(".mod-close-btn")
            if (modCloseBtn.length) {
                modCloseBtn.forEach(btn => {
                    btn.addEventListener("click", e => {
                        e.preventDefault()
                        let href = btn.getAttribute("data-modal")
                        this.closeModal(document.getElementById(href))
                    })
                })
            }
        },
        openModal(modal, closeActive = true) {
            const activeModal = document.querySelector(".modal.open")
            if (!activeModal) {
                this.lastFocusedEl = document.activeElement
                Utils.ScrollUtils.disable()
            } else {
                if (closeActive) {
                    activeModal.classList.remove("open")
                }
                this.removeFocusTrap()
            }
            modal.classList.add("open")
            this.trapFocus(modal)
        },
        closeModal(modal) {
            if (modal.querySelector("video")) {
                modal.querySelectorAll("video").forEach(v => v.pause())
            }
            modal.classList.remove("open")
            this.removeFocusTrap()
            const activeModal = document.querySelector(".modal.open")

            if (activeModal) {
                this.trapFocus(activeModal)
            } else {
                if (this.lastFocusedEl) {
                    this.lastFocusedEl.focus()
                }
                setTimeout(() => {
                    Utils.ScrollUtils.enable()
                }, animSpd)
            }
        },
        trapFocus(modal) {
            const focusable = modal.querySelectorAll(
                'a, button, input, textarea, [tabindex]:not([tabindex="-1"])'
            )
            if (!focusable.length) return
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            first.focus()
            this._focusHandler = (e) => {
                if (e.key !== "Tab") return
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault()
                        last.focus()
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault()
                        first.focus()
                    }
                }
            }
            document.addEventListener("keydown", this._focusHandler)
        },
        removeFocusTrap() {
            if (this._focusHandler) {
                document.removeEventListener("keydown", this._focusHandler)
                this._focusHandler = null
            }
        },
        setSuccessTxt(title = false, txt = false) {
            successModal.querySelector(".h4").innerHTML = title ? title : "Спасибо, что выбрали<br>Парк - Отель «Кулибин» 5 * "
            successModal.querySelector("p").innerHTML = txt ? txt : "Мы свяжемся с вами в ближайшее время"
        },
        setErrorTxt(title = false, txt = false) {
            errorModal.querySelector(".h4").innerHTML = title ? title : "Что-то пошло не так"
            errorModal.querySelector("p").innerHTML = txt ? txt : "Попробуйте снова"
        },
        openSuccessMod(title = false, txt = false) {
            this.setSuccessTxt(title, txt)
            this.openModal(successModal)
        },
        openErrorMod(title = false, txt = false) {
            this.setErrorTxt(title, txt)
            this.openModal(errorModal)
        }
    },
    FormUtils: {
        init() {
            this.initTelMask();
        },
        initTelMask(selector = 'input[type=tel]') {
            const self = this;
            document.querySelectorAll(selector).forEach(item => {
                Inputmask(
                    {
                        mask: "+7 (999) 999-99-99",
                        oncomplete: () => {
                            this.removeError(item)
                        },
                    }
                ).mask(item);
            });
        },
        isPhone(value) {
            return /^\+7 \d{3} \d{3}-\d{2}-\d{2}$/.test(value);
        },
        isEmail(value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]{2,8}$/.test(value);
        },
        isInputValid(inp) {
            if (inp.type === 'checkbox' || inp.type === 'radio') {
                return inp.checked;
            }
            if (!inp.value) return false;
            if (inp.type === 'email') {
                return this.isEmail(inp.value);
            }
            if (inp.type === 'tel') {
                return inp.inputmask?.isComplete();
            }
            return true;
        },
        maskEmail(email) {
            const [username, domain] = email.split('@');
            let maskedUsername = username.length <= 3
                ? username[0] + '***'
                : username.substring(0, 2) + '***' + username.slice(-1);
            return maskedUsername + '@' + domain;
        },
        formReset(form, cleanError = false) {
            form.querySelectorAll(".ui-input").forEach(item => item.classList.remove("error"));
            if (cleanError) form.querySelectorAll("[data-error]").forEach(el => el.textContent = '');
            form.querySelectorAll("input").forEach(inp => {
                if (!["hidden", "checkbox", "radio"].includes(inp.type)) inp.value = "";
                if (["checkbox", "radio"].includes(inp.type) && !inp.required) inp.checked = false;
            });
            if (form.querySelector("textarea")) form.querySelector("textarea").value = "";
            if (form.querySelector(".file-form__items")) form.querySelector(".file-form__items").innerHTML = "";
        },
        addError(inp) {
            inp.closest('.ui-control')?.classList.add('error');
        },
        removeError(inp) {
            inp.closest('.ui-control')?.classList.remove('error');
        },
        formValidate(e, form) {
            e.preventDefault();
            let errors = 0;
            const inpRequired = Array.from(form.querySelectorAll('input[required]'))
            if (inpRequired.length) {
                inpRequired.forEach(inp => {
                    if (!this.isInputValid(inp)) {
                        errors++;
                        this.addError(inp);
                    }
                    const eventType = ['text', 'email', 'number'].includes(inp.type) ? 'input' : 'change';
                    inp.addEventListener(eventType, () => {
                        if (this.isInputValid(inp)) {
                            this.removeError(inp)
                        }
                    });
                });
            }
            if (errors === 0) {
                form.requestSubmit();
            }
        }
    },
    SwiperUtils: {
        defaults(slider) {
            return {
                observer: true,
                observeParents: true,
                watchSlidesProgress: true,
                navigation: {
                    prevEl: slider.querySelector(".nav-btn--prev"),
                    nextEl: slider.querySelector(".nav-btn--next"),
                },
                pagination: {
                    el: slider.querySelector(".swiper-pagination"),
                    clickable: true,
                    renderBullet: function (index, className) {
                        return `<span class="${className}"><span></span></span>`;
                    },
                },
                scrollbar: {
                    el: slider.querySelector(".swiper-scrollbar"),
                    draggable: true,
                },
                speed: 800,
            };
        },
        init() {
            this.initSwiper4();
            this.initSwiper2();
            this.initSwiper1();
        },
        initSwiper4() {
            const swiper4 = document.querySelectorAll('.swiper-4');
            swiper4.forEach(item => {
                const options = {
                    ...this.defaults(item),
                    slidesPerView: item.classList.contains("awards") ? 2 : 1,
                    spaceBetween: 16,
                    autoplay: this.autoplay(item),
                    breakpoints: {
                        1023.98: {
                            slidesPerView: 4,
                            spaceBetween: 24
                        },
                        767.98: {
                            slidesPerView: 4,
                            spaceBetween: 16
                        },
                        575.98: {
                            slidesPerView: 2,
                            spaceBetween: 16
                        },
                    },
                };
                new Swiper(item.querySelector(".swiper"), options);
            });
        },
        initSwiper2() {
            const swiper4 = document.querySelectorAll('.swiper-2');
            swiper4.forEach(item => {
                const options = {
                    ...this.defaults(item),
                    slidesPerView: 1,
                    spaceBetween: 16,
                    autoplay: this.autoplay(item),
                    breakpoints: {
                        1023.98: {
                            slidesPerView: 2,
                            spaceBetween: 24
                        },
                        575.98: {
                            slidesPerView: 2,
                            spaceBetween: 16
                        },
                    },
                };
                new Swiper(item.querySelector(".swiper"), options);
            });
        },
        initSwiper1() {
            const swiper1 = document.querySelectorAll('.swiper-1');
            swiper1.forEach(item => {
                let isIntro = item.classList.contains("intro");
                let itemSwiper
                const initOrUpdateSwiper = () => {
                    let isLaptop = window.innerWidth >= bp.laptop;
                    const options = {
                        ...this.defaults(item),
                        slidesPerView: 1,
                        spaceBetween: 16,
                        effect: (isLaptop || isIntro) ? 'fade' : 'slide',
                        loop: isIntro,
                        fadeEffect: {
                            crossFade: true
                        },
                        autoplay: this.autoplay(item),
                        breakpoints: {
                            1023.98: {
                                spaceBetween: 24,
                            }
                        }
                    };
                    itemSwiper = new Swiper(item.querySelector(".swiper"), options);
                };

                initOrUpdateSwiper();
                let resizeTimeout;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        let isLaptop = window.innerWidth >= bp.laptop;
                        let nextEffect = (isLaptop || isIntro) ? 'fade' : 'slide';
                        if (itemSwiper && itemSwiper.params.effect !== nextEffect) {
                            itemSwiper.destroy(true, true);
                            initOrUpdateSwiper();
                        }
                    }, 150);
                });
            });
        },
        autoplay(slider) {
            let autoplayAttr = slider.querySelector(".swiper").dataset.autoplay;
            let autoplayOption = autoplayAttr === "true" ? { delay: 5000, pauseOnMouseEnter: true, disableOnInteraction: false } : false;
            return autoplayOption

        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".wrap").classList.add('loaded')
    Utils.init()
    setVh()
    setTimeout(() => {
        animate()
    }, 0);

    // === Menu ===
    if (iconMenu && mobMenu) {
        iconMenu.addEventListener("click", () => {
            if (!iconMenu.classList.contains("active")) {
                iconMenu.setAttribute("aria-label", "Закрыть меню")
                iconMenu.classList.add("active")
                mobMenu.classList.add("show")
                header.classList.add("show-menu")
                Utils.ScrollUtils.disable()
            } else {
                iconMenu.setAttribute("aria-expanded", false)
                iconMenu.setAttribute("aria-label", "Открыть меню")
                iconMenu.classList.remove("active")
                mobMenu.classList.remove("show")
                header.classList.remove("show-menu")
                Utils.ScrollUtils.enable()
            }
        })
        window.addEventListener("resize", () => {
            if (window.innerWidth > bp.laptop && iconMenu.classList.contains("active")) {
                iconMenu.click()
            }
        })
    }

    // === Collage Swiper ===
    const collageSlider = document.querySelector(".collage-swiper")
    if (collageSlider) {
        let collageSwiper = null;
        function initcollageSwiper() {
            if (window.innerWidth <= bp.laptop) {
                if (!collageSwiper) {
                    collageSwiper = new Swiper(collageSlider.querySelector(".swiper"), {
                        ...Utils.SwiperUtils.defaults(collageSlider),
                        slidesPerView: 1,
                        spaceBetween: 16,
                        breakpoints: {
                            480.98: {
                                slidesPerView: 2,
                            },
                        },
                    });
                }
            } else {
                if (collageSwiper) {
                    collageSwiper.destroy(true, true);
                    collageSwiper = null;
                }
            }
        }
        initcollageSwiper();
        window.addEventListener("resize", initcollageSwiper);
    }
});

window.addEventListener("scroll", animate)

// === Set Window Height ===
function setVh() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// === Page Animation ===
function animate() {
    const elements = document.querySelectorAll('[data-animation]');
    elements.forEach(async item => {
        const itemTop = item.getBoundingClientRect().top;
        const itemPoint = Math.abs(window.innerHeight - Math.min(100,item.offsetHeight * 0.1));
        const itemScrolled = itemPoint > 100 ? itemPoint : 100;
        if (itemTop - itemScrolled < 0) {
            const animName = item.getAttribute("data-animation");
            item.classList.add(animName);
            item.removeAttribute("data-animation");
        }
    });
}

// === Hover Slider ===
function hoverSlider() {
    document.querySelectorAll(".hover-slider").forEach(item => {
        const roomsImg = item.querySelectorAll(".hover-slider__img")
        for (let i = 0; i < roomsImg.length; i++) {
            let span1 = document.createElement("span")
            let span2 = document.createElement("span")
            item.querySelector(".hover-slider__hovers").append(span1)
            item.querySelector(".hover-slider__controls").append(span2)
        }
        setActive(0)
        function setActive(activeEl) {
            if (!item.querySelectorAll(".hover-slider__img")[activeEl].classList.contains("active")) {
                item.querySelectorAll(".hover-slider__img").forEach(img => img.classList.remove('active'))
                item.querySelectorAll(".hover-slider__img")[activeEl].classList.add("active")
                item.querySelectorAll(".hover-slider__controls span").forEach(span => span.classList.remove("active"))
                item.querySelectorAll(".hover-slider__controls span")[activeEl].classList.add("active")
            }
        }
        item.querySelectorAll(".hover-slider__hovers span").forEach((el, idx) => {
            el.addEventListener("touchmove", (e) => {
                setActive(idx)
            })
            el.addEventListener("touchend", () => setActive(0))
            el.addEventListener("mousemove", (e) => {
                setActive(idx)
            })
            el.addEventListener("mouseleave", () => setActive(0))
        })
    })
}
hoverSlider()