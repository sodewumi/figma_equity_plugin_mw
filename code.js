function clone(val) {
    const type = typeof val
    if (val === null) {
        return null
    } else if (type === 'undefined' || type === 'number' ||
        type === 'string' || type === 'boolean') {
        return val
    } else if (type === 'object') {
        if (val instanceof Array) {
            return val.map(x => clone(x))
        } else if (val instanceof Uint8Array) {
            return new Uint8Array(val)
        } else {
            let o = {}
            for (const key in val) {
                o[key] = clone(val[key])
            }
            return o
        }
    }
    throw 'unknown'
}

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
    else if (msg.type === 'growth') {
        const forecastNode = figma.currentPage.findOne(n => n.name === "custom_Forecast")
        const annualCompNode = figma.currentPage.findOne(n => n.name === "custom_AnnualComp")
        const companyValueNode = figma.currentPage.findOne(n => n.name === "custom_CompanyValue")
        const multiplierNode = figma.currentPage.findOne(n => n.name === "custom_Multiplier")
        const rsuGrantNode = figma.currentPage.findOne(n => n.name === "custom_RSUGrant")

        function roundToPlace(x, place) {
            const pow = Math.pow(10, place)
            return Math.round(x * pow) / pow
        }

        const startRevenue = 22.9
        const arr2021 = roundToPlace(startRevenue * msg.growth2021, 1)
        const arr2022 = roundToPlace(arr2021 * msg.growth2022, 1)
        const arr2023 = roundToPlace(arr2022 * msg.growth2023, 1)
        const arr2024 = roundToPlace(arr2023 * msg.growth2024, 1)
        const companyValue = roundToPlace(arr2024 * msg.multiplier, 1)

        // Forecast vector construction
        const bogusArr2025 = arr2024 + (arr2024 - arr2023)
        const prevMaxY = parseFloat(forecastNode.vectorPaths[0].data.split(' ')[2])
        const maxY = bogusArr2025 * 0.47619047619
        function calcY(arr, maxY) {
            return maxY - (arr * 0.47619047619)
        }
        forecastNode.vectorPaths = [{
            windingRule: "NONE",
            data: `M 0 ${maxY} L 351.25 ${maxY} L 351.25 ${calcY(bogusArr2025, maxY)} L 277.75 ${calcY(arr2024, maxY)} L 203.75 ${calcY(arr2023, maxY)} L 129.5 ${calcY(arr2022, maxY)} L 55.5 ${calcY(arr2021, maxY)} L 0 ${calcY(33.6, maxY)} L 0 ${maxY} Z`
        }]
        forecastNode.y += prevMaxY - maxY;


        const rsuGrantAnnualValue = Math.round(((companyValue * 0.13) / 4.0) * 1000.0)

        function numberWithCommas(x) {
            var nStr = x;
            nStr += '';
            var x = nStr.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        }
        figma.loadFontAsync({ family: "Inter", style: "Regular" }).then(() => {
            if (companyValue > 1000.0) {
                companyValueNode.characters = `$${numberWithCommas(roundToPlace(companyValue / 1000.0, 1))}B`
            } else {
                companyValueNode.characters = `$${numberWithCommas(companyValue)}M`
            }
            multiplierNode.characters = `${msg.multiplier}x`
            rsuGrantNode.characters = `$${numberWithCommas(rsuGrantAnnualValue)}`
            annualCompNode.characters = `$${numberWithCommas(115000 + rsuGrantAnnualValue)}`
        })
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    // figma.closePlugin();
};
