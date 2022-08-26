/*------------------API-------------------*/

const Api = (() => {
    const baseUrl = "http://localhost:4232";
    const coursePath = "courseList";

    const getCourse = () =>
        fetch([baseUrl, coursePath].join('/')).then((response) => response.json());


    const selectCourse = () => 
        fetch([baseUrl, coursePath].join('/')).then((response) => response.json());


    return {
        getCourse,
        selectCourse,
    };
})();


/*-----------------View--------------------*/
const View = (() => {
    const domstr = {
        courseContainer: '#availableCourses_container',
        deletebtn: '.deletebtn',
    };

    const render = (ele, tmp) => {
        ele.innerHTML = tmp;
    };

    const createTmp = (arr) => {
        let tmp = '';
        arr.forEach((course) => {
            let type;
            if (course.required === true) {
                type = "Compulsory"
            } else {
                type = "Elective"
            }
            tmp += `
        <li>
            <div class="deletebtn" id="${course.courseId}">
            <p>${course.courseName}</p>
            <p>Course Type: ${type}<p>
            <p>Course Credit: ${course.credit}<p>
            </div>
        </li>
         `;
        });
        return tmp
    };
    return {
        domstr,
        render,
        createTmp,
    }
})();


/*-------------------Model-------------------*/
const Model = ((api, view) => {

    class State {
        #courseList = [];

        get courseList() {
            return this.#courseList;
        }

        set courseList(newCourseList) {
            this.#courseList = [...newCourseList];

            const courseContainer = document.querySelector(view.domstr.courseContainer);
            const tmp = view.createTmp(this.#courseList)
            view.render(courseContainer, tmp)
        }
    }

    const { getCourse, selectCourse } = api;

    return {
        getCourse,
        selectCourse,
        State,
    }
})(Api, View);

/*-----------Controller-----------*/
const Controller = ((model, view) => {
    const state = new model.State();

    const selectCourse = () => {
        const courseContainer = document.querySelector(view.domstr.courseContainer);
        courseContainer.addEventListener('click', function onClick() {
            courseContainer.style.backgroundColor = 'deepskyblue';
        });
    };

    const init = () => {
        model.getCourse().then((course) => {
            state.courseList = [...course];
        })
    }

    const bootstrap = () => {
        init();
        selectCourse();
    }

    return {
        bootstrap,
    };
})(Model, View);

Controller.bootstrap();