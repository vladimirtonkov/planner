
const URL_TASKS = 'https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks';
const URL_USERS = 'https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users';


const liElementFromBacklog = document.querySelectorAll('.tasks-info__item');
const planner = document.querySelector('.planner');


const DATE = new Date();
const DAY = DATE.getDate()
const MONTH = DATE.getMonth();
let CURRENT_MONTH = ''
if (MONTH + 1 < 10) {
    CURRENT_MONTH = '0' + (MONTH + 1);
} else {
    CURRENT_MONTH = (MONTH + 1);
}
let CURRENT_YEAR = DATE.getFullYear()
let arrDate = [];
//maybe add promise


fetch(URL_TASKS)
    .then((response) => {
        return response.json()
    })
    .then((data) => {
        showTaskData(data)
    })
    .catch((error) => {
        console.log(`Message error: ${error.message}`)
    })


fetch(URL_USERS)
    .then((response) => {
        return response.json()
    })
    .then((data) => {
        showUsers(data)
    })
    .catch((error) => {
        console.log(`Message error: ${error.message}`)
    })


function showUsers(dataUsers) {
    dataUsers.forEach(item => {
        planner.insertAdjacentHTML('beforeEnd', `
                <div class="plannet__task-item personal-cards" data-idCard=${item.id}>
                    <div class="personal-cards__item personal-cards__executor">${item.firstName}</div>
                </div>
            `)
    })
    showUsersTasks()
}

function showUsersTasks() {
    const personalCards = document.querySelectorAll('.personal-cards');
    personalCards.forEach(card => {
        for (let i = 0; i < 7; i++) {
            card.insertAdjacentHTML('beforeEnd', `
                <div class="personal-cards__item" data-calendar-date=${CURRENT_YEAR}-${CURRENT_MONTH}-${arrDate[i]}></div>
            `)
        }

    })
    // setEventDragOnDrop()
}


function setEventDragOnDrop() {
    const personalCardItems = document.querySelectorAll('.personal-cards__item');
    const liElementFromBacklog = document.querySelectorAll('.tasks-info__item');

    personalCardItems.forEach(card => {
        card.addEventListener('dragenter', dragEnter);
        card.addEventListener('dragover', dragOver);
        card.addEventListener('dragleave', gragLeave);
        card.addEventListener('drop', drop);
    })

    liElementFromBacklog.forEach(elem => {
        elem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id)
        })
    })
}


function showTaskData(dataTasks) {
    const personalCards = document.querySelectorAll('.personal-cards');
    const taskInfo = document.querySelector('.tasks-info')
    dataTasks.forEach((item, counter) => {
        if (item.executor !== null) {
            let cell = personalCards[item.executor - 1].querySelectorAll('.personal-cards__item');
            for (let index = 0; index < cell.length; index++) {
                if (cell[index].dataset.calendarDate === item.planStartDate) {
                    cell[index].insertAdjacentHTML('beforeEnd', `
                        <ul class="tasks">
                            <li class="tasks__item tasks__info-data" data-title=${item.subject} ' ' ${item.description}>
                                <span class="tasks__title">${item.subject}</span>
                                <span class="tasks__time">${item.description}</span>
                            </li>
                        </ul>
                    `)
                }
            }
        } else {
            taskInfo.insertAdjacentHTML('beforeEnd', `
            <li class="tasks-info__item" id=${counter + 1} draggable="true">
                <span class="tasks-info__title">${item.subject}</span>
                <span class="tasks-info__text">${item.description}</span>
            </li>
        `)
        }
    })

    setEventDragOnDrop()
}





function setCalendarDate() {
    const dates = document.querySelector('.dates')
    for (let i = 0; i < 7; i++) {
        if (DAY + i < 10) {
            arrDate.push(`0${DAY + i}`)
        } else {
            arrDate.push(`${DAY + i}`)
        }
    }

    for (let i = 0; i < arrDate.length; i++) {
        dates.insertAdjacentHTML('beforeEnd', `
                <li class="dates__num">${arrDate[i]}.${CURRENT_MONTH}</li>
            `)
    }

}

setCalendarDate()





function dragEnter(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-border');
}

function dragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-border');
}

function gragLeave(event) {
    event.currentTarget.classList.remove('drag-border');
}

function drop(event) {
    const element = event.dataTransfer.getData('text/plain');
    const draggableElement = document.getElementById(element);
    const title = draggableElement.querySelector('.tasks-info__title').textContent;
    const text = draggableElement.querySelector('.tasks-info__text').textContent;

    event.currentTarget.classList.remove('drag-border');

    if (!event.currentTarget.closest('.personal-cards__executor')) {
        if (event.currentTarget.querySelector('.tasks') !== null) {
            draggableElement.classList.remove();
            draggableElement.className = (event.currentTarget.querySelector('.tasks__item').className || 'tasks__item');

            draggableElement.setAttribute('draggable', false);
            draggableElement.setAttribute('data-title', `${title}` + `${text}`);
            event.currentTarget.querySelector('.tasks').appendChild(draggableElement);
        } else {
            const createUlTasks = document.createElement('ul');
            createUlTasks.className = 'tasks';
            event.currentTarget.append(createUlTasks);

            draggableElement.classList.remove();
            draggableElement.className = 'tasks__item';
            draggableElement.setAttribute('draggable', false);
            draggableElement.setAttribute('data-title', `${title}` + `${text}`);
            createUlTasks.appendChild(draggableElement)

        }
    } else {

    }



}
