const canvas = document.getElementById('canvas');
const canvasClone = document.getElementById('canvas-clone');
const ctx = canvas.getContext('2d');

function copyCanvas() {
    const base64 = canvasToBase64();
    canvasClone.src = base64;
}

function drawRaw() {
    ctx.lineWidth = 10;

    const ppi = 300;

    const edgeBorder = (1 / 3) * ppi;
    const canvasWidth = 8.5 * ppi;
    const canvasHeight = 11 * ppi;
    const titleHeight = (1 / 2) * ppi;
    const weekdayHeight = (1 / 3) * ppi;
    const lunchBlocksWidth = (1 / 2) * ppi;

    function minuteToHeight(minute) {
        const startMin = 9 * 60;
        const endMin = 15 * 60 + 45;
        const minuteDiff = minute - 9 * 60; // Minutes since 9 am

        const startPixel = edgeBorder + titleHeight + weekdayHeight;
        const endPixel = canvasHeight - edgeBorder;
        const dayRatio = minuteDiff / (endMin - startMin);
        return startPixel + dayRatio * (endPixel - startPixel);
    }

    // ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.strokeStyle = 'white';
    ctx.strokeRect(
        edgeBorder,
        edgeBorder,
        canvasWidth - edgeBorder * 2,
        titleHeight,
    );

    // ctx.globalAlpha = 0.5;
    // ctx.fillStyle = "rgba(0, 0, 0, 1)";
    // ctx.fillStyle = 'Black';
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = 'bold 80px Helvetica';

    ctx.fillText(
        "The Schedule",
        // UserSettings.title.length > 0 ? UserSettings.title : 'Your Schedule',
        canvasWidth / 2,
        edgeBorder + titleHeight / 2 + 7,
    );

    const columnWidth = (canvasWidth - 2 * edgeBorder) / 5;
    const remainingHeight =
        canvasHeight - 2 * edgeBorder - titleHeight - weekdayHeight;

    // Start and end lines
    ctx.beginPath();
    ctx.moveTo(edgeBorder, edgeBorder + titleHeight);
    ctx.lineTo(edgeBorder, canvasHeight - edgeBorder);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvasWidth - edgeBorder, edgeBorder + titleHeight);
    ctx.lineTo(canvasWidth - edgeBorder, canvasHeight - edgeBorder);
    ctx.closePath();
    ctx.stroke();

    // Weekday lines
    for (let dayNum = 0; dayNum < Schedule.length; dayNum += 1) {
        const day = Schedule[dayNum];

        if (dayNum !== 0) {
            ctx.beginPath();
            ctx.moveTo(
                edgeBorder + columnWidth * dayNum,
                edgeBorder + titleHeight,
            );
            ctx.lineTo(
                edgeBorder + columnWidth * dayNum,
                canvasHeight - edgeBorder,
            );
            ctx.closePath();
            ctx.stroke();
        }

        // Top bar stroke 
        ctx.strokeStyle = 'white';
        ctx.strokeRect(
            edgeBorder + columnWidth * dayNum,
            edgeBorder + titleHeight,
            columnWidth,
            weekdayHeight,
        );

        // Color of weekday text
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = 'bold 60px Helvetica';

        ctx.fillText(
            day.dayName,
            edgeBorder + columnWidth * dayNum + columnWidth / 2,
            edgeBorder + titleHeight + weekdayHeight / 2 + 6,
        );

        for (let blockNum = 0; blockNum < day.blocks.length; blockNum += 1) {
            const block = day.blocks[blockNum];
            const thisBlockSettings =
                BlockSettings[
                    `${block.block}${
                        block.block === 'Lion' ||
                        block.block === 'Advisory' ||
                        block.block === 'WIN'
                            ? ''
                            : block.number
                    }`
                ];

            const startPixel = minuteToHeight(
                timeStringToMinute(block.startTime),
            );
            const endPixel = minuteToHeight(timeStringToMinute(block.endTime));

            if (UserSettings.useColors) {
                ctx.fillStyle = Colors[thisBlockSettings.color];
                ctx.fillRect(
                    edgeBorder + columnWidth * dayNum,
                    startPixel,
                    columnWidth,
                    endPixel - startPixel,
                );
            }

            // Setting border color
            ctx.strokeStyle = 'white';
            ctx.strokeRect(
                edgeBorder + columnWidth * dayNum,
                startPixel,
                columnWidth,
                endPixel - startPixel,
            );

            // Advisory
            if (block.block === 'Advisory') {
                // Block name
                ctx.fillStyle = 'white';
                ctx.textBaseline = 'top';
                ctx.textAlign = 'left';
                ctx.font = 'bold 50px Helvetica';

                ctx.fillText(
                    `${block.block}`,
                    edgeBorder + columnWidth * dayNum + 20,
                    startPixel + 20 + 5,
                );
                const bNameWidth = ctx.measureText(`${block.block}`).width;

                // Block Length
                ctx.font = '40px Helvetica';

                ctx.fillText(
                    `(${block.length})`,
                    edgeBorder + columnWidth * dayNum + bNameWidth + 30,
                    startPixel + 20 + 3 + 4,
                );

                // Block time
                ctx.fillStyle = 'white';
                ctx.textBaseline = 'top';
                ctx.textAlign = 'left';
                ctx.font = '45px Helvetica';

                ctx.fillText(
                    `${convertTime(
                        block.startTime,
                        UserSettings.use24h,
                    )}-${convertTime(block.endTime, UserSettings.use24h)}`,
                    edgeBorder + columnWidth * dayNum + 20,
                    startPixel + 20 + 5 + 57,
                );

                // Room Number
                ctx.fillStyle = 'white';
                ctx.textBaseline = 'top';
                ctx.textAlign = 'right';
                ctx.font = 'bold 45px Helvetica';

                ctx.fillText(
                    `${BlockSettings['Advisory'].room}`,
                    edgeBorder + columnWidth * dayNum + columnWidth - 20,
                    startPixel + 25,
                );
            } else {
                // Block Name
                ctx.fillStyle = 'white';
                ctx.textBaseline = 'top';
                ctx.textAlign = 'left';
                ctx.font = 'bold 100px Helvetica';

                ctx.fillText(
                    `${
                        // If they go to north, it's called a tiger block
                        block.block === 'Lion' && UserSettings.north
                            ? 'Tiger'
                            : block.block
                    }${block.block === 'Lion' ? '' : block.number}`,
                    edgeBorder + columnWidth * dayNum + 20,
                    startPixel + 20 + 10,
                );

                const bNameWidth = ctx.measureText(
                    `${
                        // If they go to north, it's called a tiger block
                        block.block === 'Lion' && UserSettings.north
                            ? 'Tiger'
                            : block.block
                    }${block.block === 'Lion' ? '' : block.number}`,
                ).width;

                // Block length
                ctx.font = '60px Helvetica';

                ctx.fillText(
                    `(${block.length})`,
                    edgeBorder + columnWidth * dayNum + bNameWidth + 30,
                    startPixel + 20 + 5 + 6,
                );

                // Block times
                ctx.fillStyle = 'white';
                ctx.textBaseline = 'top';
                ctx.textAlign = 'left';
                ctx.font = '50px Helvetica';

                ctx.fillText(
                    `${convertTime(
                        block.startTime,
                        UserSettings.use24h,
                    )}-${convertTime(block.endTime, UserSettings.use24h)}`,
                    edgeBorder + columnWidth * dayNum + 20,
                    startPixel + 20 + 10 + 100,
                );

                // Block info
                if (
                    block.block !== 'Lion' &&
                    block.block !== 'WIN' &&
                    thisBlockSettings.hasClass
                ) {
                    // Determine maximum line width
                    const maxWidth =
                        block.lunch.length > 0
                            ? columnWidth - 40 - lunchBlocksWidth
                            : columnWidth - 40;

                    // Class type
                    ctx.fillStyle = 'white';
                    ctx.textBaseline = 'top';
                    ctx.textAlign = 'left';
                    ctx.font = 'bold 50px Helvetica';

                    const classNameLines =
                        thisBlockSettings.class.length > 0
                            ? drawWrappedText(
                                  ctx,
                                  `${thisBlockSettings.class}`,
                                  edgeBorder + columnWidth * dayNum + 20,
                                  startPixel + 20 + 10 + 100 + 80,
                                  60,
                                  maxWidth,
                              )
                            : 0;

                    // Room number
                    ctx.font = '50px Helvetica';
                    const roomNumLines =
                        thisBlockSettings.room.length > 0
                            ? drawWrappedText(
                                  ctx,
                                  `Room ${thisBlockSettings.room}`,
                                  edgeBorder + columnWidth * dayNum + 20,
                                  startPixel +
                                      20 +
                                      10 +
                                      100 +
                                      80 +
                                      60 * classNameLines,
                                  60,
                                  maxWidth,
                              )
                            : 0;

                    // Teacher
                    drawWrappedText(
                        ctx,
                        `${thisBlockSettings.teacher}`,
                        edgeBorder + columnWidth * dayNum + 20,
                        startPixel +
                            20 +
                            10 +
                            100 +
                            80 +
                            60 * (classNameLines + roomNumLines),
                        60,
                        maxWidth,
                    );
                } else if (block.block !== 'Lion' && block.block !== 'WIN') {
                    // It's a free block!
                    ctx.fillStyle = 'white';
                    ctx.textBaseline = 'top';
                    ctx.textAlign = 'left';
                    ctx.font = 'bold 60px Helvetica';

                    ctx.fillText(
                        `Free`,
                        edgeBorder + columnWidth * dayNum + 20,
                        startPixel + 20 + 10 + 100 + 80,
                    );
                }

                // Lunches
                if (block.lunch.length > 0) {
                    ctx.beginPath();
                    ctx.moveTo(
                        edgeBorder +
                            columnWidth * dayNum +
                            (columnWidth - lunchBlocksWidth),
                        startPixel,
                    );
                    ctx.lineTo(
                        edgeBorder +
                            columnWidth * dayNum +
                            (columnWidth - lunchBlocksWidth),
                        endPixel,
                    );
                    ctx.closePath();
                    ctx.stroke();

                    for (
                        let lunchNum = 0;
                        lunchNum < block.lunch.length;
                        lunchNum += 1
                    ) {
                        const lunch = block.lunch[lunchNum];

                        const lunchStartPixel = minuteToHeight(
                            timeStringToMinute(lunch.startTime),
                        );
                        const lunchEndPixel = minuteToHeight(
                            timeStringToMinute(lunch.endTime),
                        );

                        if (
                            lunchNum === thisBlockSettings.lunch ||
                            thisBlockSettings.lunch === 3
                        ) {
                            // ctx.fillStyle = '#ffffff';
                            // ctx.fillRect(
                            //     edgeBorder +
                            //         columnWidth * dayNum +
                            //         (columnWidth - lunchBlocksWidth),
                            //     lunchStartPixel,
                            //     lunchBlocksWidth,
                            //     lunchEndPixel - lunchStartPixel,
                            // );

                            ctx.strokeStyle = '#00000066';
                            drawDiagRect(
                                ctx,
                                edgeBorder +
                                    columnWidth * dayNum +
                                    (columnWidth - lunchBlocksWidth),
                                lunchStartPixel,
                                lunchBlocksWidth,
                                lunchEndPixel - lunchStartPixel,
                                80,
                            );
                            ctx.strokeStyle = '#000000';
                        }
                        
                        ctx.strokeStyle = "white";
                        ctx.strokeRect(
                            edgeBorder +
                                columnWidth * dayNum +
                                (columnWidth - lunchBlocksWidth),
                            lunchStartPixel,
                            lunchBlocksWidth,
                            lunchEndPixel - lunchStartPixel,
                        );

                        ctx.fillStyle = 'white';
                        ctx.textBaseline = 'top';
                        ctx.textAlign = 'left';
                        ctx.font = 'bold 45px Helvetica';

                        ctx.fillText(
                            `${lunch.name}`,
                            edgeBorder +
                                columnWidth * dayNum +
                                (columnWidth - lunchBlocksWidth) +
                                20,
                            lunchStartPixel + 28,
                        );

                        ctx.font = '40px Helvetica';

                        ctx.fillText(
                            `${convertTime(
                                lunch.startTime,
                                UserSettings.use24h,
                            )}-`,
                            edgeBorder +
                                columnWidth * dayNum +
                                (columnWidth - lunchBlocksWidth) +
                                15,
                            lunchStartPixel + 30 + 60,
                        );
                        ctx.fillText(
                            `${convertTime(
                                lunch.endTime,
                                UserSettings.use24h,
                            )}`,
                            edgeBorder +
                                columnWidth * dayNum +
                                (columnWidth - lunchBlocksWidth) +
                                15,
                            lunchStartPixel + 30 + 60 + 50,
                        );
                    }
                }
            }
        }
    }

    ctx.fillStyle = 'white';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.font = 'bold 45px Helvetica';

    const footnoteOffsetY = 30;
    const footnoteOffsetX = 67;

    ctx.fillText(
        `Made with`,
        edgeBorder + columnWidth * 1 + footnoteOffsetX,
        canvasHeight - 220 + footnoteOffsetY,
    );

    const madeWithLength = ctx.measureText('Made with').width;

    ctx.fillStyle = 'red';
    ctx.font = 'bold 50px Helvetica';

    ctx.fillText(
        `❤️`,
        edgeBorder + columnWidth * 1 + 10 + footnoteOffsetX + madeWithLength,
        canvasHeight - 222 + footnoteOffsetY,
    );

    ctx.fillStyle = 'white';
    ctx.font = 'bold 45px Helvetica';

    ctx.fillText(
        `from absent.cc`,
        edgeBorder + columnWidth * 1 + footnoteOffsetX,
        canvasHeight - 170 + footnoteOffsetY,
    );

    copyCanvas();
}

// Initial draw! + debounce
const debounceInterval = 250;
let timeout = setTimeout(drawRaw, debounceInterval);

function draw() {
    clearTimeout(timeout);
    timeout = setTimeout(drawRaw, debounceInterval);
}
