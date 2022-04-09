
// Можно в отдельный файл перекинуть url и переменные
const URL_TASKS = 'https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks';
const URL_USERS = 'https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users';



const liElementFromBacklog = document.querySelectorAll('.tasks-info__item');
const planner = document.querySelector('.planner');
const SliderWeekLeftButton = document.querySelector('.buttons-slider__left');
const SliderWeekRightButton = document.querySelector('.buttons-slider__right');


const DATE = new Date();
let DAY = DATE.getDate()
let MONTH = DATE.getMonth();
let CURRENT_MONTH = ''

let CURRENT_YEAR = DATE.getFullYear()
let numberOfDaysInMonth = 0;
let arrDate = [];
let ARR_MONTH = [];



setMonthAndYear();
function setMonthAndYear() {
    numberOfDaysInMonth = new Date(CURRENT_YEAR, MONTH + 1, 0).getDate();
}

setCurrentMonth()
function setCurrentMonth() {
    for (let k = 0; k < 7; k++) {
        if (MONTH + 1 < 10) {
            CURRENT_MONTH = '0' + (MONTH + 1);
            ARR_MONTH.push('0' + (MONTH + 1))
        } else {
            CURRENT_MONTH = (MONTH + 1);
            ARR_MONTH.push(MONTH + 1)
        }
    }

}

// Получение данных по задачам с сервера
// Можно axios в место fetch поменять
async function getTasks(URL, repeatNtimes) {
    try {
        const response = await fetch(URL);
        if (!response.ok) {
            const textMessage = "Error Status code: " + response.status;
            throw new Error(textMessage);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        if (repeatNtimes === 1) {
            throw new Error;
        }
        return await getTasks(URL, repeatNtimes - 1);
    }
}

getTasks(URL_TASKS, 10).then(result => showTaskData(result));

// Получение данных по пользователям с сервера
async function getUsers(URL, repeatNtimes) {
    try {
        const response = await fetch(URL);
        if (!response.ok) {
            const textMessage = "Error Status code: " + response.status;
            throw new Error(textMessage);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        if (repeatNtimes === 1) {
            throw new Error;
        }
        return await getTasks(URL, repeatNtimes - 1);
    }
}
getUsers(URL_USERS, 10).then(result => showUsers(result))


// Выводим пользователей
function showUsers(dataUsers) {
    dataUsers.forEach((item, index) => {
        planner.insertAdjacentHTML('beforeEnd', `
                <div class="plannet__task-item personal-cards" data-id-card=${item.id}>
                    <div class="personal-cards__item personal-cards__executor" data-id-person=${index + 1}>${item.firstName}</div>
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
                <div class="personal-cards__item" data-calendar-date=${CURRENT_YEAR}-${ARR_MONTH[i]}-${arrDate[i]} data-position-cell=${i + 1}></div>
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


function addUlTaskForPersonalCardsItem(cellAddUlTask) {
    for (let index = 0; index < cellAddUlTask.length; index++) {
        if (!cellAddUlTask[index].closest('.personal-cards__executor')) {
            cellAddUlTask[index].insertAdjacentHTML('beforeEnd', `
                        <ul class="tasks"></ul>
                    `)
        }
    }
}

function showTaskData(dataTasks) {
    const personalCards = document.querySelectorAll('.personal-cards');
    const taskInfo = document.querySelector('.tasks-info');
    let cellAddUlTask = document.querySelectorAll('.personal-cards__item');


    addUlTaskForPersonalCardsItem(cellAddUlTask)

    dataTasks.forEach(item => {
        // Если у задачи не указан исполнитель (executor)
        if (item.executor !== null) {
            let cellAddExecutor = personalCards[item.executor - 1].querySelectorAll('.personal-cards__item');
            for (let index = 0; index < cellAddExecutor.length; index++) {
                if (cellAddExecutor[index].dataset.calendarDate === item.planStartDate) {
                    cellAddExecutor[index].querySelector('.tasks').insertAdjacentHTML('beforeEnd', `
                            <li class="tasks__item green-bg-color" data-title=${item.subject} ' ' ${item.description}>
                                <span class="tasks__title">${item.subject}</span>
                                <span class="tasks__time">${item.description}</span>
                            </li>
                    `)
                } else if (cellAddExecutor[index].dataset.calendarDate === item.planEndDate) {
                    // planEndDate
                    let planStart = item.planStartDate.split('-');
                    let planEnd = item.planEndDate.split('-');
                    if ((+planEnd[1]) - (+planStart[1]) === 0 && (+planEnd[2] - +planStart[2]) >= 0) {
                        cellAddExecutor[index].querySelector('.tasks').insertAdjacentHTML('beforeEnd', `
                                <li class="tasks__item red-bg-color" data-title=${item.subject} ' ' ${item.description}>
                                    <span class="tasks__title">${item.subject}</span>
                                    <span class="tasks__time">(${((+planEnd[2] - +planStart[2]) * 24)} ч)</span>
                                </li>
                        `)
                    } else {
                        cellAddExecutor[index].querySelector('.tasks').insertAdjacentHTML('beforeEnd', `
                                <li class="tasks__item red-bg-color" data-title=${item.subject} ' ' ${item.description}>
                                    <span class="tasks__title">${item.subject}</span>
                                    <span class="tasks__time">Просрочено: ${item.description}</span>
                                </li>
                        `)
                    }
                }
            }
        }
    })


    dataTasks.forEach((item) => {
        taskInfo.insertAdjacentHTML('beforeEnd', `
                <li class="tasks-info__item" id=${item.id} data-start-date=${item.planStartDate} draggable="true">
                    <span class="tasks-info__title">${item.subject}</span>
                    <span class="tasks-info__text">${item.description}</span>
                </li>
        `)
    })


    setEventDragOnDrop();
    searchTaskFromBacklog();


    if (document.querySelector('.container').closest('.opacity-background')) {
        document.querySelector('.container').classList.remove('opacity-background')
        document.querySelector('.loading').style.display = 'none';
    }
    removeDisableForButtons()
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

        removeAndAddTasksClassFromAnDraggElem(draggableElement)

        draggableElement.setAttribute('draggable', false);
        draggableElement.setAttribute('data-title', `${title}` + `${text}`);
        event.currentTarget.querySelector('.tasks').appendChild(draggableElement);



        // for post
        // let obj = {
        //     creationAuthor: 1,
        //     creationDate: `${CURRENT_YEAR}-${MONTH}-${DAY}`,
        //     // description: draggableElement.querySelector('.tasks__text').textContent,
        //     description: draggableElement.children[1].textContent,
        //     endDate: "",
        //     executor: event.currentTarget.parentNode.dataset.idCard,
        //     id: generationRandomId(),
        //     order: 1,
        //     planEndDate: `${CURRENT_YEAR}-${MONTH}-${DAY + randomPlannEndDate()}`,
        //     planStartDate: `${CURRENT_YEAR}-${MONTH}-${DAY}`,
        //     status: 1,
        //     subject: draggableElement.dataset.title
        // }
        // setCurrentDataFromTasksforMethodPost(obj);

    } else {

        let currentParent = event.currentTarget.parentNode.children;
        for (let i = 0; i < currentParent.length; i++) {

            if (currentParent[i].dataset.calendarDate === draggableElement.dataset.startDate) {
                removeAndAddTasksClassFromAnDraggElem(draggableElement)

                draggableElement.setAttribute('draggable', false);
                draggableElement.setAttribute('data-title', `${title}` + `${text}`);
                currentParent[i].querySelector('.tasks').append(draggableElement)
            }
        }


    }


}




function removeAndAddTasksClassFromAnDraggElem(draggable) {

    if (draggable) {
        draggable.classList.remove();
        draggable.className = 'tasks__item';
        draggable.children[0].classList.remove('tasks-info__title');
        draggable.children[0].classList.add('tasks__title');
        draggable.children[1].classList.remove('tasks-info__title');
        draggable.children[1].classList.add('tasks__text');
    }

}


SliderWeekLeft();

function SliderWeekLeft() {
    SliderWeekLeftButton.addEventListener('click', () => {
        const dates = document.querySelector('.dates');
        const personalCards = document.querySelectorAll('.personal-cards');

        SliderWeekRightButton.removeAttribute('disabled');
        DAY = DAY - 1;
        dates.querySelectorAll('.dates__num').forEach(calendarDate => {
            if (!calendarDate.closest('.dates__num--borderNone')) {
                calendarDate.remove();
            }
        })
        arrDate = [];
        if (DAY === 0) {
            MONTH--;
            if (MONTH <= -1) {
                // MONTH = 11;
                DAY++
                MONTH = 0;
                SliderWeekLeftButton.setAttribute('disabled', "disabled");
            } else {
                setMonthAndYear();
                DAY = numberOfDaysInMonth - 6;
                ARR_MONTH = [];
                setCurrentMonth();
            }

        }
        setCalendarDate()


        personalCards.forEach(cardItem => {
            cardItem.remove()
        })
        getUsers(URL_USERS, 10).then(result => showUsers(result))
        getTasks(URL_TASKS, 10).then(result => showTaskData(result))

        document.querySelector('.container').classList.add('opacity-background')
        document.querySelector('.loading').style.display = 'flex';

        setDisableForButtons()


    })
}

SliderWeekRight();
function SliderWeekRight() {
    SliderWeekRightButton.addEventListener('click', () => {
        const dates = document.querySelector('.dates');
        const personalCards = document.querySelectorAll('.personal-cards');
        const ExecutorUser = document.querySelector('.personal-cards__executor');

        SliderWeekLeftButton.removeAttribute('disabled');
        DAY = DAY + 1;
        dates.querySelectorAll('.dates__num').forEach(calendarDate => {
            if (!calendarDate.closest('.dates__num--borderNone')) {
                calendarDate.remove();
            }
        })
        arrDate = [];
        if (DAY + 6 > numberOfDaysInMonth) {
            MONTH++;
            if (MONTH >= 12) {
                // MONTH = 0;!
                MONTH = 11;
                DAY--;
                SliderWeekRightButton.setAttribute('disabled', "disabled");

            } else {
                DAY = 1;
                ARR_MONTH = [];
                setMonthAndYear();
                setCurrentMonth();
            }

        }
        setCalendarDate()


        personalCards.forEach(cardItem => {
            cardItem.remove()
        })
        getUsers(URL_USERS, 10).then(result => showUsers(result))
        getTasks(URL_TASKS, 10).then(result => showTaskData(result))

        document.querySelector('.container').classList.add('opacity-background')
        document.querySelector('.loading').style.display = 'block';

        setDisableForButtons()




    })
}


setDisableForButtons()

function setDisableForButtons() {
    SliderWeekRightButton.setAttribute('disabled', "disabled");
    SliderWeekLeftButton.setAttribute('disabled', "disabled");
}


function removeDisableForButtons() {
    SliderWeekRightButton.removeAttribute('disabled', "disabled");
    SliderWeekLeftButton.removeAttribute('disabled', "disabled");
}



// Один из способов поиска.
// Можно еще добавлять выделяемый цвет найденного текста.
function searchTaskFromBacklog() {
    const buttonSearch = document.querySelector('.search__button');
    const titles = document.querySelectorAll('.tasks-info__title');



    buttonSearch.addEventListener('click', (event) => {
        let inputValue = document.querySelector('.search__input').value.toLowerCase();

        event.preventDefault();

        titles.forEach(title => {
            title.parentNode.style.display = 'block';
        })

        if (inputValue.length > 3) {
            titles.forEach(title => {
                let searchTitle = title.textContent.toLowerCase();
                if (searchTitle.indexOf(inputValue.trim()) === -1) {
                    title.parentNode.style.display = 'none';
                }
            })

            document.querySelector('.backlog__text-info').style.display = 'none';

        } else if (inputValue.length > 1 && inputValue.length <= 3) {
            titles.forEach(title => {
                title.parentNode.style.display = 'block';
            })
            document.querySelector('.backlog__text-info').style.display = 'block';
        } else {
            document.querySelector('.backlog__text-info').style.display = 'none';

        }
    })
}


// function randomPlannEndDate() {
//     let randomDate = Math.floor(Math.random() * ((DAY + 5) - DAY + 1) + DAY + 5);
//     console.log('randomDate ', randomDate)
//     return randomDate;
// }

// function generationRandomId() {
//     let strId = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';

//     let word = ''
//     let lenghtStr = strId.length - 1;

//     for (let i = 0; i < 20; i++) {
//         let rand = Math.floor(Math.random() * lenghtStr);
//         word += strId[rand];
//     }

//     return word;
// }

//  ------ POST -----
// async function setCurrentDataFromTasksforMethodPost(data) {
//     try {
//         const response = await fetch(URL_TASKS, {
//             mode: "no-cors",
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(data)
//         });
//         const json = await response.json();
//         return json;
//     } catch (error) {
//         console.log('ERROR');
//     }
// }






//-------------------------------------------------
// function getTaskItem(cellDirection = '', shifts) {
//     const taskInfoItem = document.querySelectorAll('.tasks-info__item');
//     const personalCards = document.querySelectorAll('.personal-cards');
//     const dataFromLocalStorage = JSON.parse(localStorage.getItem('ArrLocalStorage'));
//     // const BacklogIdItem = dataFromLocalStorage.idDraggableElement;
//     let liElement;
//     dataFromLocalStorage.forEach(obj => {
//         taskInfoItem.forEach(item => {
//             if (item.id === obj.idDraggableElement) {
//                 liElement = item
//             }
//         })
//     })
//     removeAndAddTasksClassFromAnDraggElem(liElement)
//     dataFromLocalStorage.forEach(obj => {
//         personalCards.forEach(card => {
//             let posCell = card.children[obj.positionCell].dataset.positionCell;
//             if (cellDirection === '+') {
//                 if (card.dataset.idCard === obj.idUsers) {
//                     card.children[+obj.positionCell + shifts].querySelector('.tasks').append(liElement)
//                 }
//             } else if (cellDirection === '-') {
//                 if (card.dataset.idCard === obj.idUsers) {
//                     console.log('card.children[+obj.positionCell - shifts] ', card.children[+obj.positionCell - shifts].dataset.calendarDate)
//                     if (card.children[+obj.positionCell - shifts].dataset.calendarDate) {
//                         card.children[+obj.positionCell - shifts].querySelector('.tasks').append(liElement)
//                     }
//                 }
//             } else {
//                 if (card.dataset.idCard === obj.idUsers) {
//                     card.children[obj.positionCell].querySelector('.tasks').append(liElement)
//                 }
//             }

//         })
//     })
// }
