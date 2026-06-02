const preloader = document.querySelector(".preloader")
let preloaderHiddenTimeOut = 0
if (preloader) {
    preloaderHiddenTimeOut = 1800
    enableScroll()
    disableScroll()
    setTimeout(() => {
        preloader.classList.add('loaded');
        setTimeout(() => {
            enableScroll()
            ScrollTrigger.refresh()
        }, 400);
    }, 1400);
}
const overlay = document.querySelector(".overlay")
const header = document.querySelector(".header")
const menuMobileBtn = document.querySelector('.menu-mobile__btn');
const mobMenu = document.querySelector('.menu-mobile');
const iconMenu = document.querySelector('.icon-menu');
const modals = document.querySelectorAll(".modal")
const successModal = document.querySelector("#success-modal")
const errorModal = document.querySelector("#error-modal")
const dropdowns = document.querySelectorAll(".dropdown")
const cookiePopup = document.querySelector("#cookie-popup")
const pageUp = document.querySelector(".page-up")
const scrollIndicator = document.querySelector(".scroll-indicator");
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
        // Сookie
        this.CookieUtils.init();
        // Скролл и header
        this.ScrollUtils.init();
        // Модалки
        this.ModalUtils.init();
        //Dropdown-меню
        this.DropdownUtils.init()
        // Формы
        this.FormUtils.init();
        this.FileformUtils.init();
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
            document.documentElement.style.scrollbarColor = "#591A0B #EAE6E1";
            customScroll.forEach(item => { item.style.scrollbarWidth = "thin"; item.style.scrollbarColor = "#591A0B transparent" });

        },
        initScrollHandlers() {
            let lastScroll = this.scrollPos();
            window.addEventListener("scroll", () => {
                let currentScroll = this.scrollPos();
                this.handleHeaderScroll(currentScroll, lastScroll);
                this.handlePageUp(currentScroll);
                this.handleScrollIndicator(currentScroll);
                lastScroll = currentScroll;
            });
            window.addEventListener("resize", () => {
                console.log(this.resizeTimeout)
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
        handlePageUp(currentScroll) {
            if (!pageUp) return
            if (currentScroll > this.winH) {
                pageUp.classList.add("show")
                if (this.winH - document.querySelector(".footer").getBoundingClientRect().top >= 0) {
                    pageUp.classList.remove("show")
                } else {
                    pageUp.classList.add("show")
                }
            } else if (pageUp) {
                pageUp.classList.remove("show")
            }
            pageUp.addEventListener("click", () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        },
        handleScrollIndicator(currentScroll) {
            if (!scrollIndicator) return
            scrollIndicator.style.width = 100 * currentScroll / (document.body.scrollHeight - this.winH) + "%"
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
    CookieUtils: {
        COOKIE_NAME: 'site_cookie_consent',
        COOKIE_VALUE: 'accepted',
        COOKIE_DAYS: 365,
        init() {
            if (!cookiePopup) return;
            if (!this.hasCookieAccepted()) {
                this.show();
                const cookieAccept = cookiePopup.querySelector(".cookie__accept");
                if (cookieAccept) {
                    cookieAccept.addEventListener('click', () => {
                        this.setCookie();
                        this.hide();
                    });
                }
            } else {
                this.hide();
            }
        },
        setCookie() {
            const date = new Date();
            date.setTime(date.getTime() + this.COOKIE_DAYS * 24 * 60 * 60 * 1000);
            const expires = "expires=" + date.toUTCString();
            let cookieStr = `${this.COOKIE_NAME}=${encodeURIComponent(this.COOKIE_VALUE)}; ${expires}; path=/; SameSite=Lax`;
            if (location.protocol === 'https:') cookieStr += '; Secure';
            document.cookie = cookieStr;
        },
        hasCookieAccepted() {
            const cookies = document.cookie.split('; ');
            const pref = this.COOKIE_NAME + '=';
            const cookieItem = cookies.find(item => item.startsWith(pref));
            return cookieItem ? decodeURIComponent(cookieItem.substring(pref.length)) === this.COOKIE_VALUE : false;
        },
        show() {
            cookiePopup.classList.add("show");
            cookiePopup.setAttribute('aria-hidden', 'false');
        },
        hide() {
            cookiePopup.classList.remove("show");
            setTimeout(() => {
                cookiePopup.remove();
            }, 300);
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
    DropdownUtils: {
        init() {
            this.initDropdownsClick()

        },
        initDropdownsClick() {
            dropdowns.forEach(item => {
                item.querySelector(".dropdown__header").addEventListener("click", () => {
                    item.classList.contains("open") ? this.hide(item) : this.show(item)
                })
            })
        },
        show(item) {
            item.classList.add("open");
            item.setAttribute("aria-expanded", true);
            item.querySelectorAll(".dropdown__options input").forEach(inp => {
                inp.addEventListener("change", (e) => {
                    this.setActiveOption(item)
                });
            });
            const clickOutside = (e) => {
                if (!item.contains(e.target)) {
                    this.hide(item);
                    document.removeEventListener('click', clickOutside);
                }
            };
            document.addEventListener("click", clickOutside);
        },
        setActiveOption(item) {
            item.querySelector(".dropdown__header").classList.add("checked")
            if (item.classList.contains("radio-select")) {
                let activeInpTxt = item.querySelector("input:checked").nextElementSibling.innerHTML
                item.querySelector(".dropdown__header span").innerHTML = activeInpTxt
                this.hide(item)
            }
        },
        hide(item) {
            item.classList.remove("open");
            item.setAttribute("aria-expanded", false);
        }
    },
    FileformUtils: {
        allFileTypes: [
            { "extension": ".png", "mimeType": "image/png" },
            { "extension": [".jpg", ".jpeg"], "mimeType": "image/jpeg" },
            { "extension": ".gif", "mimeType": "image/gif" },
            { "extension": ".bmp", "mimeType": "image/bmp" },
            { "extension": ".txt", "mimeType": "text/plain" },
            { "extension": ".rtf", "mimeType": "application/rtf" },
            { "extension": [".ppt", ".pot", ".pps", ".ppa"], "mimeType": "application/vnd.ms-powerpoint" },
            { "extension": ".pptx", "mimeType": "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
            { "extension": ".odp", "mimeType": "application/vnd.oasis.opendocument.presentation" },
            { "extension": ".ods", "mimeType": "application/vnd.oasis.opendocument.spreadsheet" },
            { "extension": ".doc", "mimeType": "application/msword" },
            { "extension": ".docx", "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
            { "extension": ".pdf", "mimeType": "application/pdf" },
            { "extension": [".xls", ".xlt", ".xla", ".xlsb", ".xlsm", ".xltx", ".xltm"], "mimeType": "application/vnd.ms-excel" },
            { "extension": ".xlsx", "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
            { "extension": ".odt", "mimeType": "application/vnd.oasis.opendocument.text" }
        ],
        init() {
            const forms = document.querySelectorAll(".file-form");
            forms.forEach(form => this.initForm(form));
        },
        validateFile(file, input) {
            const maxSize = input.getAttribute("data-max-size");
            const accept = input.getAttribute("accept");
            let fileTypes = [];
            if (accept) {
                const acceptArr = accept.split(",").map(a => a.trim().toLowerCase());
                this.allFileTypes.forEach(type => {
                    if (Array.isArray(type.extension)) {
                        if (type.extension.some(ext => acceptArr.includes(ext))) fileTypes.push(type.mimeType);
                    } else if (acceptArr.includes(type.extension)) fileTypes.push(type.mimeType);
                });
            }
            if (maxSize && file.size > maxSize * 1024 * 1024) return `Файл должен быть менее ${maxSize} МБ`;
            if (accept && fileTypes.length && !fileTypes.includes(file.type)) return `Разрешённые форматы: ${accept}`;
            return null;
        },
        addFile(file, item) {
            const error = this.validateFile(file, item.querySelector('input'));
            if (error) {
                item.querySelector("input").value = "";
                item.classList.add("error");
                item.querySelectorAll(".file-form__item").forEach(el => el.remove());
                item.querySelector("[data-error]").textContent = error;
                return;
            }

            item.classList.remove("error");
            item.querySelector("[data-error]").textContent = "";
            const reader = new FileReader();
            reader.onload = () => {
                item.querySelector(".file-form__items").insertAdjacentHTML("afterbegin",
                    `<div class="file-form__item">
                    <div class="file-form__name">${file.name}</div>
                    <button type="button" class="btn-cross file-form__del"></button>
                </div>`);
            };
            reader.readAsDataURL(file);
        },
        initForm(fileForm) {
            const input = fileForm.querySelector("input");
            input.addEventListener("change", e => {
                fileForm.querySelectorAll(".file-form__item").forEach(el => el.remove());
                Array.from(e.target.files).forEach(file => this.addFile(file, fileForm));
            });

            fileForm.addEventListener("click", e => {
                fileForm.querySelectorAll(".file-form__del").forEach((del, idx) => {
                    if (del.contains(e.target)) {
                        const dt = new DataTransfer();
                        Array.from(fileForm.querySelector("input").files).forEach((f, i) => { if (i !== idx) dt.items.add(f) });
                        fileForm.querySelector("input").files = dt.files;
                        setTimeout(() => del.parentNode.remove(), 0);
                    }
                });
            });
            ["dragenter", "dragover", "dragleave"].forEach(evt => {
                fileForm.addEventListener(evt, e => e.preventDefault());
            });
            fileForm.addEventListener("drop", e => {
                e.preventDefault();
                const dt = new DataTransfer();
                dt.items.add(e.dataTransfer.files[0]);
                const files = Array.from(dt.files);
                fileForm.querySelector("input").files = dt.files;
                fileForm.querySelectorAll(".file-form__item").forEach(el => el.remove());
                files.forEach(file => this.addFile(file, fileForm));
            });
        }
    },
    FormUtils: {
        init() {
            this.initTelMask();
            this.initPasswordToggle()
            this.initDisabledForms()
            this.initInputReset()
        },
        initPasswordToggle(selector = ".ui-input--password") {
            const items = document.querySelectorAll(selector);
            items.forEach(item => {
                const eye = item.querySelector(".ui-input__eye");
                const input = item.querySelector("input");
                if (!eye || !input) return;
                eye.addEventListener("click", () => {
                    item.classList.toggle("show-password");
                    input.type = item.classList.contains("show-password") ? "text" : "password";
                });
            });
        },
        initDisabledForms(selector = ".disabled-form") {
            const forms = document.querySelectorAll(selector);
            forms.forEach(form => {
                const requiredInputs = form.querySelectorAll("input[required]");
                if (!requiredInputs.length) return;

                let timeOut;
                this.toggleSubmitBtn(form);
                requiredInputs.forEach(inp => {
                    const eventType = ['text', 'email', 'number'].includes(inp.type) ? 'input' : 'change';
                    inp.addEventListener(eventType, () => {
                        if (this.isInputValid(inp)) {
                            this.removeError(inp)
                        }
                        if (['text', 'email', 'number'].includes(inp.type)) {
                            clearTimeout(timeOut);
                            timeOut = setTimeout(() => this.toggleSubmitBtn(form), 300);
                        } else {
                            this.toggleSubmitBtn(form);
                        }
                    });
                });
            });
        },
        initTelMask(selector = 'input[type=tel]') {
            const self = this;
            document.querySelectorAll(selector).forEach(item => {
                Inputmask(
                    {
                        mask: "+7 (999) 999-99-99",
                        oncomplete: () => {
                            this.removeError(item)
                            const parentForm = item.closest(".form")
                            if (parentForm && parentForm.classList.contains("disabled-form")) {
                                this.toggleSubmitBtn(parentForm)
                            }
                        },
                    }
                ).mask(item);
            });
        },
        initInputReset() {
            const itemForm = document.querySelectorAll(".ui-input")
            itemForm.forEach(item => {
                const resetBtn = item.querySelector(".ui-input__reset")
                if (resetBtn) {
                    this.showResetBtn(item, resetBtn)
                    item.querySelector("input").addEventListener("input", e => {
                        this.showResetBtn(item, resetBtn)
                    })
                    resetBtn.addEventListener("click", e => {
                        e.preventDefault()
                        item.querySelector("input").value = ""
                        resetBtn.classList.remove("show")
                    })
                }
            })
        },
        showResetBtn(item, resetBtn) {
            if (item.querySelector("input").value.length > 0) {
                resetBtn.classList.add("show")
            } else {
                resetBtn.classList.remove("show")
            }
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
        toggleSubmitBtn(form) {
            const findItem = Array.from(form.querySelectorAll("input[required]")).find(inp => {
                return !inp.value || (inp.type === 'email' && !this.isEmail(inp.value)) || (inp.type === 'tel' && !this.isPhone(inp.value)) || (['checkbox', 'radio'].includes(inp.type) && !inp.checked);
            });
            const btn = form.querySelector("button[type=submit]");
            if (findItem) btn.setAttribute("disabled", true);
            else btn.removeAttribute("disabled");
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
            } else {
                let firstErrorEl = form.querySelector('.ui-control.error')
                // Utils.ScrollUtils.smoothScrollTo(firstErrorEl)
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
                    slidesPerView: 2,
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
                        767.98: {
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
                const options = {
                    ...this.defaults(item),
                    slidesPerView: 1,
                    effect: "fade",
                    loop: item.classList.contains("intro")? true: false,
                    fadeEffect: { crossFade: true },
                    autoplay: this.autoplay(item),
                };
                new Swiper(item.querySelector(".swiper"), options);
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
    const headerNav = document.querySelector(".header__nav")
    if (iconMenu && headerNav) {
        iconMenu.addEventListener("click", () => {
            if (!iconMenu.classList.contains("active")) {
                iconMenu.setAttribute("aria-label", "Закрыть меню")
                iconMenu.classList.add("active")
                headerNav.classList.add("open")
                disableScroll()
            } else {
                iconMenu.setAttribute("aria-expanded", false)
                iconMenu.setAttribute("aria-label", "Открыть меню")
                iconMenu.classList.remove("active")
                headerNav.classList.remove("open")
                enableScroll()
            }
        })
        window.addEventListener("resize", () => {
            if (window.innerWidth > bp.desktop && iconMenu.classList.contains("active")) {
                iconMenu.click()
            }
        })
    }

    // === Anchor Links ===
    const anchorLinks = document.querySelectorAll(".js-anchor")
    anchorLinks.forEach(item => {
        item.addEventListener("click", e => {
            let idx = item.getAttribute("href").indexOf("#")
            const href = item.getAttribute("href").substring(idx)
            let dest = document.querySelector(href)
            if (dest) {
                e.preventDefault()
                let destPos = dest.getBoundingClientRect().top < 0 ? dest.getBoundingClientRect().top - header.clientHeight - 10 : dest.getBoundingClientRect().top - 10
                if (iconMenu.classList.contains("active")) {
                    iconMenu.click()
                    setTimeout(() => {
                        window.scrollTo({ top: scrollPos() + destPos, behavior: 'smooth' })
                    }, 300);
                } else {
                    window.scrollTo({ top: scrollPos() + destPos, behavior: 'smooth' })
                }
            }
        })
    })

    // === Tabs Switch Blocks ===
    const switchBlock = document.querySelectorAll(".switch-block")
    switchBlock.forEach(item => {
        tabSwitch(item.querySelectorAll("[data-tab]"), item.querySelectorAll("[data-block]"))
    })
});

window.addEventListener("scroll", animate)

// === Path To Sprite Id  ===
function sprite(id) {
    return '<svg><use xlink:href="img/svg/sprite.svg#' + id + '"></use></svg>'
}

// === Set Window Height ===
function setVh() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// === SmoothDrop ===
function smoothDrop(header, body, dur = false) {
    let animDur = dur ? dur : 500
    body.style.overflow = 'hidden';
    body.style.transition = `height ${animDur}ms ease`;
    body.style['-webkit-transition'] = `height ${animDur}ms ease`;
    if (!header.classList.contains("active")) {
        header.parentNode.classList.add("active")
        body.style.display = 'block';
        let height = body.clientHeight + 'px';
        body.style.height = '0px';
        setTimeout(function () {
            body.style.height = height;
            setTimeout(() => {
                body.style.height = null
                header.classList.add("active")
            }, animDur);
        }, 0);
    } else {
        header.parentNode.classList.remove("active")
        let height = body.clientHeight + 'px';
        body.style.height = height
        setTimeout(function () {
            body.style.height = "0"
            setTimeout(() => {
                body.style.display = 'none';
                body.style.height = null
                header.classList.remove("active")
            }, animDur);
        }, 0);
    }
}

// === TabSwitch ===
function tabSwitch(nav, block) {
    nav.forEach((item, idx) => {
        item.addEventListener("click", () => {
            nav.forEach(el => {
                el.classList.remove("active")
                el.setAttribute("aria-selected", false)
            })
            item.classList.add("active")
            item.setAttribute("aria-selected", true)
            block.forEach(el => {
                if (el.dataset.block === item.dataset.tab) {
                    if (!el.classList.contains("active")) {
                        el.classList.add("active")
                        el.style.opacity = "0"
                        setTimeout(() => {
                            el.style.opacity = "1"
                        }, 0);
                    }
                } else {
                    el.classList.remove("active")
                }
            })
        })
    });
}

// === TabScroll Button ===
function tabsBtnVisibility(item) {
    let scrollW = item.querySelector(".tabs").scrollWidth
    let clientW = item.querySelector(".tabs").clientWidth
    let scrollLeft = item.querySelector(".tabs").scrollLeft
    scrollW - clientW - scrollLeft > 5 ? item.classList.add("show-btn") : item.classList.remove("show-btn")
}

// === Quantity ===
function quantityOnChange(item, count, inStock) {
    disabledMinusBtn(item, count)
    if (inStock) {
        disabledPlusBtn(item, count, inStock)
    }
    clearTimeout(lblTimeout)
    addToCart(count)
}
function setQuantity() {
    const quantity = document.querySelectorAll(".quantity")
    if (quantity.length) {
        quantity.forEach(item => {
            const inp = item.querySelector(".quantity__count")
            let inStock = Number(item.getAttribute("data-stock"))
            let count = inp.value
            disabledMinusBtn(item, count)
            if (inStock) {
                disabledPlusBtn(item, count, inStock)
            }
            inp.addEventListener("change", e => {
                if (Number.isInteger(e.target.value) || e.target.value >= 1) {
                    if (e.target.value.split("")[0] == 0) {
                        inp.value = Math.round(e.target.value.substring(1))
                    } else {
                        inp.value = inStock && Math.round(e.target.value) > inStock ? inStock : Math.round(e.target.value)
                    }
                } else {
                    inp.value = 1
                }
                count = inp.value
                quantityOnChange(item, count, inStock)
            })
            item.querySelector(".js-minus").addEventListener("click", () => {
                if (inp.value > 1) {
                    inp.value--
                    count = inp.value;
                } else {
                    count = 0
                }
                quantityOnChange(item, count, inStock)
            })
            item.querySelector(".js-plus").addEventListener("click", () => {
                inp.value++
                count = inp.value
                quantityOnChange(item, count, inStock)
            })
        })
    }
}
setQuantity()

// === Page Animation ===
function animate() {
    const elements = document.querySelectorAll('[data-animation]');
    elements.forEach(async item => {
        const itemTop = item.getBoundingClientRect().top;
        const itemPoint = Math.abs(window.innerHeight - item.offsetHeight * 0.1);
        const itemScrolled = itemPoint > 100 ? itemPoint : 100;
        if (itemTop - itemScrolled < 0) {
            const animName = item.getAttribute("data-animation");
            if (preloader && !preloader.classList.contains("loaded")) {
                await new Promise(resolve => setTimeout(resolve, preloaderHiddenTimeOut));
            }
            item.classList.add(animName);
            item.removeAttribute("data-animation");
        }
    });
}

// rooms slider
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