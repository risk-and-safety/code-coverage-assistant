import { details, summary, b, fragment, table, tbody, tr, th } from "./html";
import { percentage } from "./lcov";
import { tabulate } from "./tabulate";

/**
 * Compares two arrays of objects and returns with unique lines update
 * @param {number} pdiff value from diff percentage
 * @returns {string} emoji string for negative/positive pdiff
 */
const renderEmoji = pdiff => {
    if (pdiff < 0) return "🔴";
    if (pdiff >= 0) return "🟢";
};

/**
 * Compares two arrays of objects and returns with unique lines update
 * @param {Array} otherArray
 * @returns {Function} function with filtering non original lines
 */
const comparer = otherArray => current =>
    otherArray.filter(
        other =>
            other.lines.found === current.lines.found &&
            other.lines.hit === current.lines.hit,
    ).length === 0;

/**
 * Github comment for monorepo
 * @param {Array<{packageName, lcovPath}>} lcovArrayForMonorepo
 * @param {{Array<{packageName, lcovBasePath}>}} lcovBaseArrayForMonorepo
 * @param {*} options
 */
export function commentForMonorepo(
    lcovArrayForMonorepo,
    lcovBaseArrayForMonorepo,
    options,
) {
		const { appName, base } = options;
    const html = lcovArrayForMonorepo.map(lcovObj => {
        const baseLcov = lcovBaseArrayForMonorepo.find(
            el => el.packageName === lcovObj.packageName,
        );

        const pbefore = baseLcov ? percentage(baseLcov.lcov) : 0;
        const pafter = baseLcov ? percentage(lcovObj.lcov) : 0;
        const pdiff = pafter - pbefore;
        const plus = pdiff > 0 ? "+" : "";
        const arrow = pdiff === 0 ? "" : pdiff < 0 ? "▾" : "▴";

        const pdiffHtml = baseLcov ? th(renderEmoji(pdiff), " ", arrow, " ", plus, pdiff.toFixed(2), "%") : "";
				let report = lcovObj.lcov;

        if (baseLcov) {
            const onlyInLcov = lcovObj.lcov.filter(comparer(baseLcov));
            const onlyInBefore = baseLcov.filter(comparer(lcovObj.lcov));
            report = onlyInBefore.concat(onlyInLcov);
        }

        return `${table(
            tbody(
                tr(
                    th(lcovObj.packageName),
                    th(percentage(lcovObj.lcov).toFixed(2), "%"),
                    pdiffHtml,
                ),
            ),
        )} \n\n ${details(
            summary("Coverage Report"),
            tabulate(report, options),
        )} <br/>`;
    });

    const title = appName ? `Coverage after merging ${appName} into ${b(base)} <p></p>` : `Coverage after merging into ${b(base)} <p></p>`;

    return fragment(title, html.join(""));
}

/**
 * Github comment for single repo
 * @param {raw lcov} lcov
 * @param {*} options
 */
export function comment(lcov, before, options) {
		const { appName, base } = options;
    const pbefore = before ? percentage(before) : 0;
    const pafter = before ? percentage(lcov) : 0;
    const pdiff = pafter - pbefore;
    const plus = pdiff > 0 ? "+" : "";
    const arrow = pdiff === 0 ? "" : pdiff < 0 ? "▾" : "▴";

		const pdiffHtml = before ? th(renderEmoji(pdiff), " ", arrow, " ", plus, pdiff.toFixed(2), "%") : "";

    let report = lcov;

    if (before) {
        const onlyInLcov = lcov.filter(comparer(before));
        const onlyInBefore = before.filter(comparer(lcov));
        report = onlyInBefore.concat(onlyInLcov);
    }

		const title = appName ? `Coverage after merging ${appName} into ${b(base)} <p></p>` : `Coverage after merging into ${b(base)} <p></p>`;

    return fragment(
				title,
        table(tbody(tr(th(percentage(lcov).toFixed(2), "%"), pdiffHtml))),
        "\n\n",
        details(summary("Coverage Report"), tabulate(report, options)),
    );
}

/**
 * Diff in coverage percentage for single repo
 * @param {raw lcov} lcov
 * @param {raw base lcov} before
 * @param {*} options
 */
export function diff(lcov, before, options) {
    return comment(lcov, before, options);
}

/**
 * Diff in coverage percentage for monorepo
 * @param {Array<{packageName, lcovPath}>} lcovArrayForMonorepo
 * @param {{Array<{packageName, lcovBasePath}>}} lcovBaseArrayForMonorepo
 * @param {*} options
 */
export function diffForMonorepo(
    lcovArrayForMonorepo,
    lcovBaseArrayForMonorepo,
    options,
) {
    return commentForMonorepo(
        lcovArrayForMonorepo,
        lcovBaseArrayForMonorepo,
        options,
    );
}
