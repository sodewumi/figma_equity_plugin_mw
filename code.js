// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
const INITIAL = 10;
function calculateEquity(options) {
    // TODO- Add real calculation
    return options * 4 * 4;
}
function calculateXCoor(growth, year) {
    // TODO- Add real calculation
    return INITIAL * growth * year;
}
const graphScales = {
    1: 55,
    2: 44,
    3: 33,
    4: 22,
    5: 11,
};
function calculateWidth(growthMultiplier, times) {
    const scale = graphScales[growthMultiplier];
    return 10 * Math.pow(growthMultiplier, times);
}
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    if (msg.type === 'equity') {
        const useVal = figma.currentPage.findOne(n => n.name === "plugin_equity_copy");
        const xCoordinates = [
            figma.currentPage.findOne(n => n.name === "plugin_x_one"),
            figma.currentPage.findOne(n => n.name === "plugin_x_two"),
            figma.currentPage.findOne(n => n.name === "plugin_x_three"),
            figma.currentPage.findOne(n => n.name === "plugin_x_four")
        ];
        const barWidths = [
            figma.currentPage.findOne(n => n.name === "plugin_bar_one"),
            figma.currentPage.findOne(n => n.name === "plugin_bar_two"),
            figma.currentPage.findOne(n => n.name === "plugin_bar_three"),
            figma.currentPage.findOne(n => n.name === "plugin_bar_four"),
        ];
        figma.loadFontAsync({ family: "Whyte", style: "Regular" }).then(() => {
            xCoordinates.forEach((xCoordinate, i) => xCoordinate.characters = `$${calculateXCoor(msg.growthMultiplier, i + 1)}`);
            useVal.characters = `Value for ${msg.optionsCount} shares is $${calculateEquity(msg.optionsCount)}`;
        });
        barWidths.forEach((bar, i) => bar.resize(calculateWidth(msg.growthMultiplier, i + 1), bar.height));
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
};
