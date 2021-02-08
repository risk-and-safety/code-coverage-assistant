import { details, summary, b, fragment, table, tbody, tr, th } from "./html";
import { percentage } from "./lcov";
import { tabulate } from "./tabulate";

/**
 * Github comment for monorepo
 * @param {Array<{packageName, lcovPath}>} lcovArrayForMonorepo
 * @param {{Array<{packageName, lcovBasePath}>}} lcovBaseArrayForMonorepo
 * @param {*} options
 */
const commentForMonorepo = (
    lcovArrayForMonorepo,
    lcovBaseArrayForMonorepo,
    options,
) => {
    const html = lcovArrayForMonorepo.map(lcovObj => {
        const baseLcov = lcovBaseArrayForMonorepo.find(
            el => el.packageName === lcovObj.packageName,
        );

        const pbefore = baseLcov ? percentage(baseLcov.lcov) : 0;
        const pafter = baseLcov ? percentage(lcovObj.lcov) : 0;
        const pdiff = pafter - pbefore;
        const plus = pdiff > 0 ? "+" : "";

        let arrow = "";
        if (pdiff < 0) {
            arrow = "▾";
        } else if (pdiff > 0) {
            arrow = "▴";
        }

        const pdiffHtml = baseLcov
            ? th(arrow, " ", plus, pdiff.toFixed(2), "%")
            : "";

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
            tabulate(lcovObj.lcov, options),
        )} <br/>`;
    });

    return fragment(
        `Coverage after merging into ${b(options.base)} <p></p>`,
        html.join(""),
    );
};

/**
 * Github comment for single repo
 * @param {raw lcov} lcov
 * @param {*} options
 */
const comment = (lcov, before, options) => {
    const pbefore = before ? percentage(before) : 0;
    const pafter = before ? percentage(lcov) : 0;
    const pdiff = pafter - pbefore;
    const plus = pdiff > 0 ? "+" : "";

    let arrow = "";
    if (pdiff < 0) {
        arrow = "▾";
    } else if (pdiff > 0) {
        arrow = "▴";
    }

    const pdiffHtml = before ? th(arrow, " ", plus, pdiff.toFixed(2), "%") : "";

    return fragment(
        `Coverage after merging ${b(options.head)} into ${b(
            options.base,
        )} <p></p>`,
        table(tbody(tr(th(percentage(lcov).toFixed(2), "%"), pdiffHtml))),
        "\n\n",
        details(summary("Coverage Report"), tabulate(lcov, options)),
    );
};

/**
 * Diff in coverage percentage for single repo
 * @param {raw lcov} lcov
 * @param {raw base lcov} before
 * @param {*} options
 */
export const diff = (lcov, before, options) => comment(lcov, before, options);

/**
 * Diff in coverage percentage for monorepo
 * @param {Array<{packageName, lcovPath}>} lcovArrayForMonorepo
 * @param {{Array<{packageName, lcovBasePath}>}} lcovBaseArrayForMonorepo
 * @param {*} options
 */
export const diffForMonorepo = (
    lcovArrayForMonorepo,
    lcovBaseArrayForMonorepo,
    options,
) =>
    commentForMonorepo(lcovArrayForMonorepo, lcovBaseArrayForMonorepo, options);
