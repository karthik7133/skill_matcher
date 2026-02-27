/**
 * Generates a human-readable explanation from the score breakdown
 */
exports.generateExplanation = (breakdown) => {
    let explanation = `Your Match Score is ${breakdown.total}%. `;

    const reasons = [];
    if (breakdown.requiredSkills >= 30) reasons.push("You have most of the required technical skills.");
    if (breakdown.preferredSkills >= 10) reasons.push("Your profile matches several preferred qualifications.");
    if (breakdown.projects > 0) reasons.push(`Your projects demonstrated relevant experience (+${breakdown.projects} points).`);
    if (breakdown.proficiency >= 10) reasons.push("Your proficiency level in key areas is high.");

    if (reasons.length > 0) {
        explanation += "Breakdown: " + reasons.join(" ");
    } else {
        explanation += "Try adding more relevant projects or improving skill proficiency to boost your score.";
    }

    return explanation;
};
