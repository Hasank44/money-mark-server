export const getBDTaskDayRange = () => {
    const now = new Date();
    const bdNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const startBD = new Date(bdNow);
    startBD.setHours(6, 0, 0, 0);
    if (bdNow < startBD) {
        startBD.setDate(startBD.getDate() - 1);
    }
    const endBD = new Date(startBD);
    endBD.setDate(endBD.getDate() + 1);
    return {
        startUTC: new Date(startBD.getTime() - 6 * 60 * 60 * 1000),
        endUTC: new Date(endBD.getTime() - 6 * 60 * 60 * 1000),
    };
};