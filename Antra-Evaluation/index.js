/*------------------API-------------------*/

const Api = (() => {
    const baseUrl = "http://localhost:4232";
    const coursePath = "courseList";

    const getCourse = () =>
        fetch([baseUrl, coursePath].join('/')).then((response) => response.json());


    return {
        getCourse,

    };
})();

/*-----------------View--------------------*/
const View = (() => {


    const domstr = {
        courseContainer: '#availableCourses_container',
        submit: '#selectbtn',
        credit: '#credit',
        selectedContainer: '#selectedCourses_container',
    };



    const selected = (element) => {
        element.classList.add("selected")
    }




    const toggleButton = () => {
        const element = document.querySelector(domstr.submit)
        element.disabled = true;
    }



    const render = (ele, tmp) => {
        ele.innerHTML = tmp;
    };



    const createTmp = (arr) => {
        let tmp = '';
        arr.forEach((course, i) => {
            let type;
            if (course.required === true) {
                type = "Compulsory"
            } else {
                type = "Elective"
            }
            tmp += `
        <li class="courseItem" id=${course.courseId}>
            <p>${course.courseName}</p>
            <p>Course Type: ${type}<p>
            <p id="course_credit">Course Credit: ${course.credit}<p>
        </li>
         `;
        });
        return tmp
    };



    const creditTmp = (credit) => {
        return `${credit}`
    }



    return {
        domstr,
        render,
        createTmp,
        selected,
        creditTmp,
        toggleButton,
    }
})();

/*-------------------Model-------------------*/
const Model = ((api, view) => {

    class State {
        #courseList = [];
        #selectedState = [];
        #credit = 0;
        #submittedState = [];

        get courseList() {
            return this.#courseList;
        }

        set courseList(courses) {
            this.#courseList = courses
            const tmp = view.createTmp(this.#courseList);
            const element = document.querySelector(view.domstr.courseContainer);
            view.render(element, tmp);

        }

        get selectedState() {
            return this.#selectedState;
        }

        set selectedState(selected) {
            if (this.#selectedState.includes(+selected.id)) {
                this.selectedState = [...this.#selectedState.filter((id) => id !== +selected.id)]
            } else {
                this.#selectedState = [...this.#selectedState, +selected.id]
            }
            view.selected(selected)
        }

        get credit() {
            return this.#credit
        }

        set credit(credit) {
            this.#credit = credit
            const element = document.querySelector(view.domstr.credit)
            const tmp = view.creditTmp(this.#credit)
            view.render(element, tmp)
        }

        get submittedState() {
            return this.#submittedState
        }

        set submittedState(submitted) {
            this.#submittedState = submitted
            const tmp = view.createTmp(this.#submittedState);
            const element = document.querySelector(view.domstr.selectedContainer)
            view.render(element, tmp)
        }
    }
    const { getCourse } = api;

    return {
        getCourse,
        State,
    }
})(Api, View);

/*-----------Controller-----------*/
const Controller = ((model, view) => {
    const state = new model.State();


    const selectCourse = () => {
        const element = document.querySelector(view.domstr.courseContainer);
        const submit = document.querySelector(view.domstr.submit);
        let target = undefined;
        element.addEventListener('click', (event) => {
            if (submit.disabled)
                return;
            target = event.target;


            while (!target.classList.contains("courseItem")) {
                target = target.parentElement;
            }
            const course = state.courseList[+target.id - 1];
            if (!state.selectedState.includes(course.courseId)) {
                if ((course.credit + state.credit) > 18) {
                    alert("You can only choose up to 18 credits in one semester")
                } else {
                    state.credit += course.credit;
                    state.selectedState = target;
                }
            } else {
                state.credit -= course.credit
                state.selectedState = target;
            }
        })
    }


    const submitted = () => {
        const element = document.querySelector(view.domstr.submit)
        element.addEventListener('click', (event) => {
            if (window.confirm(`You have chosen ${state.credit} credits for this semester. You cannot change once you submit. Do you want to confirm?`)) {
                state.submittedState = state.courseList.filter((course) => {
                    return state.selectedState.includes(course.courseId)
                });
                state.courseList = state.courseList.filter((course) => {
                    return !state.selectedState.includes(course.courseId)
                });
                view.toggleButton();
            }

        })
    }

    const init = () => {
        model.getCourse().then((course) => {
            state.courseList = course;
            state.submittedState = [];
            state.credit = 0
        })
    }

    const bootstrap = () => {
        init();
        selectCourse();
        submitted();
    }

    return {
        bootstrap,
    };
})(Model, View);

Controller.bootstrap();