const periodTypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const colorMappings = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
    G: 0,
    WIN: 0,
    Advisory: 0,
    Lion: 0,
};

const dummyCard = document.querySelector('.dummy.class-card');
const cardsContainer = document.querySelector('.class-cards');

periodTypes.forEach((periodName) => {
    // Generate card
    const card = dummyCard.cloneNode(true);

    cardsContainer.insertBefore(card, document.querySelector('.Advisory'));
    card.classList.remove('dummy');

    let blockPages = [];
    const blockTabs = [
        card.querySelector('.block-tab-1'),
        card.querySelector('.block-tab-2'),
        card.querySelector('.block-tab-3'),
    ];
    let settingsCache = [
        {
            hasClass: true,
            lunch: -1,
            class: '',
            teacher: '',
            room: '',
            color: colorMappings[periodName],
        },
        {
            hasClass: true,
            lunch: -1,
            class: '',
            teacher: '',
            room: '',
            color: colorMappings[periodName],
        },
        {
            hasClass: true,
            lunch: -1,
            class: '',
            teacher: '',
            room: '',
            color: colorMappings[periodName],
        },
    ];

    let differentBlocks = false;
    let blockPage = 0;

    // Create new pages
    const originalBlockPage = card.querySelector('.block-page');
    for (let i = 0; i < blockTabs.length; i += 1) {
        blockPages.push(originalBlockPage.cloneNode(true));
        blockPages[i].classList.add(`block-page-${i + 1}`);
        blockTabs[i].querySelector('a').innerHTML = `${periodName}${i + 1}`;
    }
    originalBlockPage.remove();
    card.querySelector('.card-content').append(...blockPages);

    // Change names
    card.querySelector('.card-header-title').innerHTML = periodName;

    // Open/close
    card.querySelector('.card-header').addEventListener('click', () => {
        card.classList.toggle('is-closed');
    });

    const updateBlockTabs = () => {
        if (differentBlocks) {
            card.querySelector('.block-tabs').style.display = 'block';
        } else {
            card.querySelector('.block-tabs').style.display = 'none';
        }

        for (let i = 0; i < blockTabs.length; i += 1) {
            if (i === blockPage) {
                blockTabs[i].classList.add('is-active');
                blockPages[i].style.display = 'block';
            } else {
                blockTabs[i].classList.remove('is-active');
                blockPages[i].style.display = 'none';
            }
        }
    };

    card.querySelector('.differentBlocks').addEventListener('change', () => {
        differentBlocks = !card.querySelector('.differentBlocks').checked;
        blockPage = 0;
        updateBlockTabs();
    });

    const write = () => {
        if (!differentBlocks) {
            // Copy settings pages
            settingsCache[1] = Object.assign({}, settingsCache[0]);
            settingsCache[2] = Object.assign({}, settingsCache[0]);
        }
        BlockSettings[`${periodName}1`] = settingsCache[0];
        BlockSettings[`${periodName}2`] = settingsCache[1];
        BlockSettings[`${periodName}3`] = settingsCache[2];
        draw();
        writeback();
    };

    let writebackListenerLock = false;

    const writeback = () => {
        for (let i = 0; i < blockTabs.length; i += 1) {
            writebackListenerLock = true;
            blockPages[i].querySelector('.hasClass').checked =
                settingsCache[i].hasClass;

            blockPages[i].querySelector('.class').value =
                settingsCache[i].class;

            blockPages[i].querySelector('.room').value = settingsCache[i].room;

            blockPages[i].querySelector('.teacher').value =
                settingsCache[i].teacher;

            blockPages[i].querySelector('.lunch').value =
                settingsCache[i].lunch;

            blockPages[i].querySelector('.color').value =
                settingsCache[i].color;
            writebackListenerLock = false;
        }
    };

    for (let i = 0; i < blockTabs.length; i += 1) {
        const hideClassInfo = () => {
            blockPages[i].querySelector('.class-info-fields').style.display =
                'none';
        };

        const showClassInfo = () => {
            blockPages[i].querySelector('.class-info-fields').style.display =
                'block';
        };

        blockTabs[i].addEventListener('click', () => {
            blockPage = i;
            updateBlockTabs();
        });

        blockPages[i]
            .querySelector('.hasClass')
            .addEventListener('change', () => {
                if (writebackListenerLock) return;
                settingsCache[i].hasClass =
                    blockPages[i].querySelector('.hasClass').checked;
                if (settingsCache[i].hasClass) {
                    settingsCache[i] = {
                        hasClass: true,
                        lunch: -1,
                        class: '',
                        teacher: '',
                        room: '',
                        color: colorMappings[periodName],
                    };
                    showClassInfo();
                } else {
                    settingsCache[i] = {
                        hasClass: false,
                        lunch: 3,
                        class: '',
                        teacher: '',
                        room: '',
                        color: 0,
                    };
                    hideClassInfo();
                }
                write();
            });

        blockPages[i].querySelector('.class').addEventListener('input', () => {
            if (writebackListenerLock) return;
            settingsCache[i].class =
                blockPages[i].querySelector('.class').value;
            write();
        });

        blockPages[i].querySelector('.room').addEventListener('input', () => {
            if (writebackListenerLock) return;
            settingsCache[i].room = blockPages[i].querySelector('.room').value;

            if (
                settingsCache[i].room.startsWith('23') ||
                settingsCache[i].room.startsWith('9') ||
                settingsCache[i].room.startsWith('4')
            ) {
                settingsCache[i].lunch = 0;
            } else if (
                settingsCache[i].room.startsWith('12') ||
                settingsCache[i].room.startsWith('13') ||
                settingsCache[i].room.startsWith('21') ||
                settingsCache[i].room.startsWith('6')
            ) {
                settingsCache[i].lunch = 1;
            } else if (
                settingsCache[i].room.startsWith('11') ||
                settingsCache[i].room.startsWith('22') ||
                settingsCache[i].room.startsWith('3') ||
                settingsCache[i].room.startsWith('5')
            ) {
                settingsCache[i].lunch = 2;
            }

            write();
        });

        blockPages[i]
            .querySelector('.teacher')
            .addEventListener('input', () => {
                if (writebackListenerLock) return;
                settingsCache[i].teacher =
                    blockPages[i].querySelector('.teacher').value;
                write();
            });

        blockPages[i].querySelector('.lunch').addEventListener('input', () => {
            if (writebackListenerLock) return;
            settingsCache[i].lunch = parseInt(
                blockPages[i].querySelector('.lunch').value,
            );
            write();
        });

        blockPages[i].querySelector('.color').addEventListener('input', () => {
            if (writebackListenerLock) return;
            settingsCache[i].color = parseInt(
                blockPages[i].querySelector('.color').value,
            );
            write();
        });
    }

    updateBlockTabs();
    write();
    writeback();
});

['Advisory', 'WIN', 'Lion'].forEach((periodName) => {
    const card = document.querySelector(`.${periodName}`);

    let settingsCache = {
        hasClass: true,
        lunch: -1,
        class: '',
        teacher: '',
        room: '',
        color: colorMappings[periodName],
    };

    // Open/close
    card.querySelector('.card-header').addEventListener('click', () => {
        card.classList.toggle('is-closed');
    });

    const write = () => {
        BlockSettings[periodName] = settingsCache;

        draw();
        writeback();
    };

    let writebackListenerLock = false;

    const writeback = () => {
        writebackListenerLock = true;

        if (periodName === 'Advisory') {
            card.querySelector('.room').value = settingsCache.room;
        }

        card.querySelector('.color').value = settingsCache.color;

        writebackListenerLock = false;
    };

    if (periodName === 'Advisory') {
        card.querySelector('.room').addEventListener('input', () => {
            if (writebackListenerLock) return;
            settingsCache.room = card.querySelector('.room').value;

            write();
        });
    }

    card.querySelector('.color').addEventListener('input', () => {
        if (writebackListenerLock) return;
        settingsCache.color = parseInt(card.querySelector('.color').value);
        write();
    });

    write();
    writeback();
});
