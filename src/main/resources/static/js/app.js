/* =========================================================
   GLOBAL CONFIGURATION
========================================================= */

const API_BASE = "/api";


/* =========================================================
   AUTHENTICATION
========================================================= */

function getToken() {

    return localStorage.getItem("jwtToken");

}


function getUser() {

    const user =
        localStorage.getItem("taxGuardUser");

    if (!user) {
        return null;
    }

    try {

        return JSON.parse(user);

    }
    catch (error) {

        return null;

    }

}


function setUser(user) {

    localStorage.setItem(
        "taxGuardUser",
        JSON.stringify(user)
    );

}


function logout() {

    localStorage.removeItem("jwtToken");

    localStorage.removeItem("taxGuardUser");

    window.location.href = "/login";

}


function initializeUser() {

    const user =
        getUser();

    if (!user) {
        return;
    }


    const usernameElement =
        document.getElementById(
            "currentUsername"
        );

    const roleElement =
        document.getElementById(
            "currentRole"
        );

    const initialElement =
        document.getElementById(
            "userInitial"
        );

    const welcomeElement =
        document.getElementById(
            "welcomeUser"
        );


    if (usernameElement) {

        usernameElement.textContent =
            user.username || "User";

    }


    if (roleElement) {

        roleElement.textContent =
            user.role || "USER";

    }


    if (initialElement) {

        initialElement.textContent =
            (user.username || "U")
                .charAt(0)
                .toUpperCase();

    }


    if (welcomeElement) {

        welcomeElement.textContent =
            user.username || "User";

    }

}


/* =========================================================
   API HELPER
========================================================= */

async function apiRequest(
    url,
    options = {}
) {

    const token =
        getToken();


    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {})

    };


    if (token) {

        headers["Authorization"] =
            "Bearer " + token;

    }


    const response =
        await fetch(
            API_BASE + url,
            {
                ...options,
                headers
            }
        );


    if (response.status === 401) {

        logout();

        return null;

    }


    if (response.status === 403) {

        showToast(
            "You do not have permission to perform this action.",
            "danger"
        );

        return null;

    }


    if (!response.ok) {

        let message =
            "Something went wrong.";


        try {

            const error =
                await response.json();

            message =
                error.message ||
                error.error ||
                message;

        }
        catch (e) {
        }


        throw new Error(
            message
        );

    }


    if (response.status === 204) {

        return null;

    }


    return response.json();

}


/* =========================================================
   LOGIN
========================================================= */

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "username"
                ).value;

            const password =
                document.getElementById(
                    "password"
                ).value;


            const errorBox =
                document.getElementById(
                    "loginError"
                );

            const loginText =
                document.getElementById(
                    "loginText"
                );

            const spinner =
                document.getElementById(
                    "loginSpinner"
                );


            errorBox.classList.add(
                "d-none"
            );


            loginText.textContent =
                "Signing in...";


            spinner.classList.remove(
                "d-none"
            );


            try {

                const response =
                    await fetch(
                        "/api/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                username:
                                    username,

                                password:
                                    password

                            })
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Invalid username or password"
                    );

                }


                const data =
                    await response.json();


                const token =
                    data.token ||
                    data.jwtToken ||
                    data.accessToken;


                if (!token) {

                    throw new Error(
                        "JWT token was not returned by the server."
                    );

                }


                localStorage.setItem(
                    "jwtToken",
                    token
                );


                setUser({

                    username:
                        data.username ||
                        username,

                    role:
                        data.role ||
                        "USER"

                });


                window.location.href =
                    "/dashboard";

            }
            catch (error) {

                errorBox.textContent =
                    error.message;


                errorBox.classList.remove(
                    "d-none"
                );

            }
            finally {

                loginText.textContent =
                    "Sign In";


                spinner.classList.add(
                    "d-none"
                );

            }

        }
    );

}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

function togglePassword() {

    const password =
        document.getElementById(
            "password"
        );

    const icon =
        document.getElementById(
            "passwordIcon"
        );


    if (!password) {
        return;
    }


    if (password.type === "password") {

        password.type =
            "text";


        if (icon) {

            icon.className =
                "bi bi-eye-slash";

        }

    }
    else {

        password.type =
            "password";


        if (icon) {

            icon.className =
                "bi bi-eye";

        }

    }

}


/* =========================================================
   SIDEBAR
========================================================= */

function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (sidebar) {

        sidebar.classList.toggle(
            "show"
        );

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard() {

    initializeUser();


    try {

        const transactions =
            await apiRequest(
                "/transactions"
            );


        if (transactions) {

            const list =
                Array.isArray(transactions)
                    ? transactions
                    : transactions.content || [];


            updateDashboardTransactions(
                list
            );


            updateDashboardStatistics(
                list
            );

        }


        const exceptions =
            await apiRequest(
                "/exceptions"
            );


        if (exceptions) {

            const list =
                Array.isArray(exceptions)
                    ? exceptions
                    : exceptions.content || [];


            updateExceptionStatistics(
                list
            );


            updateRecentExceptions(
                list
            );

        }


        createDashboardCharts();

    }
    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        showToast(
            error.message,
            "danger"
        );

    }

}


/* =========================================================
   DASHBOARD TRANSACTIONS
========================================================= */

function updateDashboardTransactions(
    transactions
) {

    const body =
        document.getElementById(
            "recentTransactions"
        );


    if (!body) {
        return;
    }


    const recent =
        transactions.slice(
            0,
            5
        );


    if (recent.length === 0) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="text-center py-4">

                    No transactions available.

                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        recent.map(t => `

            <tr>

                <td>

                    <strong>
                        ${escapeHtml(
                            t.transactionId
                        )}
                    </strong>

                </td>


                <td>

                    ${escapeHtml(
                        t.customerId
                    )}

                </td>


                <td>

                    ₹${formatNumber(
                        t.amount
                    )}

                </td>


                <td>

                    ${statusBadge(
                        t.complianceStatus
                    )}

                </td>

            </tr>

        `).join("");

}


/* =========================================================
   DASHBOARD STATISTICS
========================================================= */

function updateDashboardStatistics(
    transactions
) {

    const total =
        transactions.length;


    const taxGap =
        transactions.reduce(
            (sum, t) =>
                sum +
                Number(
                    t.taxGap || 0
                ),
            0
        );


    const nonCompliant =
        transactions.filter(
            t =>
                t.complianceStatus !==
                "COMPLIANT"
        ).length;


    const score =
        total === 0
            ? 100
            : (
                100 -
                (
                    nonCompliant /
                    total *
                    100
                )
            );


    setText(
        "totalTransactions",
        formatNumber(total)
    );


    setText(
        "totalTaxGap",
        formatNumber(taxGap)
    );


    setText(
        "complianceScore",
        score.toFixed(1)
    );


    setText(
        "donutScore",
        score.toFixed(1) + "%"
    );

}


/* =========================================================
   DASHBOARD EXCEPTIONS
========================================================= */

function updateExceptionStatistics(
    exceptions
) {

    const high =
        exceptions.filter(
            e =>
                e.severity === "HIGH"
        ).length;


    const medium =
        exceptions.filter(
            e =>
                e.severity === "MEDIUM"
        ).length;


    const low =
        exceptions.filter(
            e =>
                e.severity === "LOW"
        ).length;


    setText(
        "highExceptions",
        high
    );


    setText(
        "mediumExceptions",
        medium
    );


    setText(
        "lowExceptions",
        low
    );

}


function updateRecentExceptions(
    exceptions
) {

    const container =
        document.getElementById(
            "recentExceptions"
        );


    if (!container) {
        return;
    }


    const recent =
        exceptions.slice(
            0,
            5
        );


    if (!recent.length) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-check-circle"></i>
                <h6>No recent exceptions</h6>
                <p>No compliance exceptions found.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        recent.map(e => `

            <div class="exception-item">

                <div class="exception-item-header">

                    <strong>
                        ${escapeHtml(
                            e.ruleName
                        )}
                    </strong>

                    ${severityBadge(
                        e.severity
                    )}

                </div>


                <div class="exception-message">

                    ${escapeHtml(
                        e.message
                    )}

                </div>


                <small>

                    Transaction:
                    ${escapeHtml(
                        e.transactionId
                    )}

                </small>

            </div>

        `).join("");

}


/* =========================================================
   TRANSACTIONS
========================================================= */

async function loadTransactions() {

    const body =
        document.getElementById(
            "transactionTableBody"
        );


    if (!body) {
        return;
    }


    body.innerHTML = `

        <tr>

            <td
                colspan="8"
                class="text-center py-5">

                Loading transactions...

            </td>

        </tr>

    `;


    try {

        const data =
            await apiRequest(
                "/transactions"
            );


        const transactions =
            Array.isArray(data)
                ? data
                : data?.content || [];


        renderTransactions(
            transactions
        );

    }
    catch (error) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center text-danger py-5">

                    ${escapeHtml(
                        error.message
                    )}

                </td>

            </tr>

        `;

    }

}


function renderTransactions(
    transactions
) {

    const body =
        document.getElementById(
            "transactionTableBody"
        );


    const count =
        document.getElementById(
            "transactionCount"
        );


    if (!body) {
        return;
    }


    if (count) {

        count.textContent =
            `${transactions.length} records`;

    }


    if (!transactions.length) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center py-5">

                    No transactions found.

                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        transactions.map(t => `

            <tr>

                <td>

                    <strong>
                        ${escapeHtml(
                            t.transactionId
                        )}
                    </strong>

                </td>


                <td>

                    ${escapeHtml(
                        t.customerId
                    )}

                </td>


                <td>

                    <span
                        class="badge text-bg-light">

                        ${escapeHtml(
                            t.transactionType
                        )}

                    </span>

                </td>


                <td>

                    ₹${formatNumber(
                        t.amount
                    )}

                </td>


                <td>

                    ₹${formatNumber(
                        t.expectedTax
                    )}

                </td>


                <td>

                    <strong>

                        ₹${formatNumber(
                            t.taxGap
                        )}

                    </strong>

                </td>


                <td>

                    ${statusBadge(
                        t.complianceStatus
                    )}

                </td>


                <td>

                    <a
                        href="/transaction-details?id=${encodeURIComponent(
                            t.transactionId
                        )}"
                        class="btn btn-sm btn-light">

                        <i class="bi bi-arrow-right"></i>

                    </a>

                </td>

            </tr>

        `).join("");

}


/* =========================================================
   CREATE TRANSACTION
========================================================= */

async function createTransaction() {

    const request = {

        transactionId:
            document.getElementById(
                "transactionId"
            ).value,

        date:
            document.getElementById(
                "transactionDate"
            ).value,

        customerId:
            document.getElementById(
                "customerId"
            ).value,

        amount:
            Number(
                document.getElementById(
                    "amount"
                ).value
            ),

        taxRate:
            Number(
                document.getElementById(
                    "taxRate"
                ).value
            ) / 100,

        reportedTax:
            Number(
                document.getElementById(
                    "reportedTax"
                ).value
            ),

        transactionType:
            document.getElementById(
                "transactionType"
            ).value,

        originalTransactionId:
            document.getElementById(
                "originalTransactionId"
            ).value ||
            null

    };


    try {

        await apiRequest(
            "/transactions",
            {
                method: "POST",

                body:
                    JSON.stringify(
                        request
                    )

            }
        );


        showToast(
            "Transaction created successfully.",
            "success"
        );


        const modal =
            bootstrap.Modal.getInstance(
                document.getElementById(
                    "transactionModal"
                )
            );


        if (modal) {
            modal.hide();
        }


        const form =
            document.getElementById(
                "transactionForm"
            );


        if (form) {
            form.reset();
        }


        loadTransactions();

    }
    catch (error) {

        showToast(
            error.message,
            "danger"
        );

    }

}


/* =========================================================
   TRANSACTION DETAILS
========================================================= */

async function loadTransactionDetails() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const transactionId =
        params.get("id");


    if (!transactionId) {

        showToast(
            "Transaction ID not provided.",
            "danger"
        );

        return;

    }


    try {

        /* -------------------------------------------------
           1. Get all transactions
        ------------------------------------------------- */

        const transactionData =
            await apiRequest(
                "/transactions"
            );


        const transactions =
            Array.isArray(
                transactionData
            )
                ? transactionData
                : transactionData?.content || [];


        /* -------------------------------------------------
           2. Find requested transaction
        ------------------------------------------------- */

        const transaction =
            transactions.find(
                t =>
                    t.transactionId ===
                    transactionId
            );


        if (!transaction) {

            showToast(
                "Transaction not found.",
                "danger"
            );

            return;

        }


        /* -------------------------------------------------
           3. Render transaction
        ------------------------------------------------- */

        renderTransactionDetails(
            transaction
        );


        /* -------------------------------------------------
           4. Get exceptions for THIS transaction
        ------------------------------------------------- */

        const exceptionData =
            await apiRequest(
                "/exceptions?transactionId=" +
                encodeURIComponent(
                    transactionId
                )
            );


        const exceptions =
            Array.isArray(
                exceptionData
            )
                ? exceptionData
                : exceptionData?.content || [];


        /* -------------------------------------------------
           5. Render exceptions
        ------------------------------------------------- */

        renderTransactionExceptions(
            exceptions
        );

    }
    catch (error) {

        console.error(
            "Transaction details error:",
            error
        );


        showToast(
            error.message,
            "danger"
        );

    }

}


/* =========================================================
   RENDER TRANSACTION DETAILS
========================================================= */

function renderTransactionDetails(
    t
) {

    setText(
        "detailTransactionId",
        t.transactionId
    );


    setText(
        "detailId",
        t.transactionId
    );


    setText(
        "detailCustomer",
        t.customerId
    );


    setText(
        "detailDate",
        t.date ||
        t.transactionDate
    );


    setText(
        "detailType",
        t.transactionType
    );


    setText(
        "detailAmount",
        "₹" +
        formatNumber(
            t.amount
        )
    );


    setText(
        "detailRate",
        Number(
            t.taxRate || 0
        ) * 100 +
        "%"
    );


    setText(
        "detailReportedTax",
        "₹" +
        formatNumber(
            t.reportedTax
        )
    );


    setText(
        "detailExpectedTax",
        "₹" +
        formatNumber(
            t.expectedTax
        )
    );


    setText(
        "gapExpected",
        "₹" +
        formatNumber(
            t.expectedTax
        )
    );


    setText(
        "gapReported",
        "₹" +
        formatNumber(
            t.reportedTax
        )
    );


    setText(
        "gapAmount",
        "₹" +
        formatNumber(
            t.taxGap
        )
    );


    setStatus(
        "detailStatus",
        t.complianceStatus
    );


    setText(
        "complianceResult",
        t.complianceStatus
    );


    setStatus(
        "validationStatus",
        t.validationStatus
    );


    setText(
        "validationReason",
        t.failureReason ||
        ""
    );


    const description =
        document.getElementById(
            "complianceDescription"
        );


    if (description) {

        if (
            t.complianceStatus ===
            "COMPLIANT"
        ) {

            description.textContent =
                "No significant tax discrepancy detected.";

        }
        else if (
            t.complianceStatus ===
            "UNDERPAID"
        ) {

            description.textContent =
                "Reported tax is lower than expected.";

        }
        else if (
            t.complianceStatus ===
            "OVERPAID"
        ) {

            description.textContent =
                "Reported tax is higher than expected.";

        }
        else {

            description.textContent =
                "Transaction requires compliance review.";

        }

    }

}


/* =========================================================
   TRANSACTION EXCEPTIONS
========================================================= */

function renderTransactionExceptions(
    exceptions
) {

    const container =
        document.getElementById(
            "transactionExceptions"
        );


    if (!container) {
        return;
    }


    /* -------------------------------------------------
       No exceptions
    ------------------------------------------------- */

    if (
        !exceptions ||
        exceptions.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="bi bi-check-circle"></i>

                <h6>
                    No exceptions found
                </h6>

                <p>
                    This transaction passed all configured rules.
                </p>

            </div>

        `;

        return;

    }


    /* -------------------------------------------------
       Exceptions exist
    ------------------------------------------------- */

    container.innerHTML =
        exceptions.map(
            exception => `

                <div class="exception-item">

                    <div
                        class="exception-item-header">

                        <div>

                            <strong>

                                ${escapeHtml(
                                    exception.ruleName
                                )}

                            </strong>

                        </div>


                        <div>

                            ${severityBadge(
                                exception.severity
                            )}

                        </div>

                    </div>


                    <div
                        class="exception-message">

                        <i
                            class="bi bi-exclamation-triangle">
                        </i>

                        <span>

                            ${escapeHtml(
                                exception.message
                            )}

                        </span>

                    </div>


                    <div
                        class="exception-meta">

                        <span>

                            <i
                                class="bi bi-person">
                            </i>

                            Customer:

                            ${escapeHtml(
                                exception.customerId
                            )}

                        </span>


                        <span>

                            <i
                                class="bi bi-clock">
                            </i>

                            ${formatDate(
                                exception.createdAt
                            )}

                        </span>

                    </div>

                </div>

            `
        ).join("");

}


/* =========================================================
   EXCEPTIONS PAGE
========================================================= */

async function loadExceptions() {

    const body =
        document.getElementById(
            "exceptionTableBody"
        );


    if (!body) {
        return;
    }


    try {

        let url =
            "/exceptions";


        const customer =
            document.getElementById(
                "exceptionCustomer"
            )?.value;


        const severity =
            document.getElementById(
                "exceptionSeverity"
            )?.value;


        const rule =
            document.getElementById(
                "exceptionRule"
            )?.value;


        const params =
            new URLSearchParams();


        if (customer) {

            params.append(
                "customerId",
                customer
            );

        }


        if (severity) {

            params.append(
                "severity",
                severity
            );

        }


        if (rule) {

            params.append(
                "ruleName",
                rule
            );

        }


        if (params.toString()) {

            url +=
                "?" +
                params.toString();

        }


        const data =
            await apiRequest(
                url
            );


        const exceptions =
            Array.isArray(data)
                ? data
                : data?.content || [];


        renderExceptions(
            exceptions
        );

    }
    catch (error) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="text-center text-danger py-5">

                    ${escapeHtml(
                        error.message
                    )}

                </td>

            </tr>

        `;

    }

}


function renderExceptions(
    exceptions
) {

    const body =
        document.getElementById(
            "exceptionTableBody"
        );


    if (!body) {
        return;
    }


    const count =
        document.getElementById(
            "exceptionCount"
        );


    if (count) {

        count.textContent =
            `${exceptions.length} exceptions`;

    }


    const high =
        exceptions.filter(
            e =>
                e.severity === "HIGH"
        ).length;


    const medium =
        exceptions.filter(
            e =>
                e.severity === "MEDIUM"
        ).length;


    const low =
        exceptions.filter(
            e =>
                e.severity === "LOW"
        ).length;


    setText(
        "highExceptions",
        high
    );


    setText(
        "mediumExceptions",
        medium
    );


    setText(
        "lowExceptions",
        low
    );


    if (!exceptions.length) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="text-center py-5">

                    No compliance exceptions found.

                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        exceptions.map(
            e => `

                <tr>

                    <td>

                        <strong>

                            ${escapeHtml(
                                e.transactionId
                            )}

                        </strong>

                    </td>


                    <td>

                        ${escapeHtml(
                            e.customerId
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            e.ruleName
                        )}

                    </td>


                    <td>

                        ${severityBadge(
                            e.severity
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            e.message
                        )}

                    </td>


                    <td>

                        ${formatDate(
                            e.createdAt
                        )}

                    </td>

                </tr>

            `
        ).join("");

}


/* =========================================================
   REPORTS
========================================================= */

async function loadReports() {

    try {

        const summary =
            await apiRequest(
                "/reports/customer-tax-summary"
            );


        if (summary) {

            renderCustomerReport(
                summary
            );

        }


        const exceptions =
            await apiRequest(
                "/reports/exception-summary"
            );


        if (exceptions) {

            renderExceptionReport(
                exceptions
            );

        }

    }
    catch (error) {

        console.error(
            error
        );


        showToast(
            error.message,
            "danger"
        );

    }

}


function renderCustomerReport(
    data
) {

    const rows =
        Array.isArray(data)
            ? data
            : data?.content || [];


    const body =
        document.getElementById(
            "customerReportBody"
        );


    if (!body) {
        return;
    }


    const totalAmount =
        rows.reduce(
            (sum, r) =>
                sum +
                Number(
                    r.totalAmount || 0
                ),
            0
        );


    const expected =
        rows.reduce(
            (sum, r) =>
                sum +
                Number(
                    r.totalExpectedTax || 0
                ),
            0
        );


    const reported =
        rows.reduce(
            (sum, r) =>
                sum +
                Number(
                    r.totalReportedTax || 0
                ),
            0
        );


    const gap =
        rows.reduce(
            (sum, r) =>
                sum +
                Number(
                    r.totalTaxGap || 0
                ),
            0
        );


    setText(
        "reportAmount",
        "₹" +
        formatNumber(
            totalAmount
        )
    );


    setText(
        "reportExpected",
        "₹" +
        formatNumber(
            expected
        )
    );


    setText(
        "reportReported",
        "₹" +
        formatNumber(
            reported
        )
    );


    setText(
        "reportGap",
        "₹" +
        formatNumber(
            gap
        )
    );


    if (!rows.length) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="text-center py-5">

                    No report data available.

                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        rows.map(
            r => `

                <tr>

                    <td>

                        <strong>

                            ${escapeHtml(
                                r.customerId
                            )}

                        </strong>

                    </td>


                    <td>

                        ${formatNumber(
                            r.totalTransactions
                        )}

                    </td>


                    <td>

                        ₹${formatNumber(
                            r.totalAmount
                        )}

                    </td>


                    <td>

                        ₹${formatNumber(
                            r.totalExpectedTax
                        )}

                    </td>


                    <td>

                        ₹${formatNumber(
                            r.totalReportedTax
                        )}

                    </td>


                    <td>

                        ₹${formatNumber(
                            r.totalTaxGap
                        )}

                    </td>

                </tr>

            `
        ).join("");

}


function renderExceptionReport(
    data
) {

    const summary =
        Array.isArray(data)
            ? data[0]
            : data;


    if (!summary) {
        return;
    }


    setText(
        "reportHigh",
        summary.highSeverity ||
        summary.high ||
        0
    );


    setText(
        "reportMedium",
        summary.mediumSeverity ||
        summary.medium ||
        0
    );


    setText(
        "reportLow",
        summary.lowSeverity ||
        summary.low ||
        0
    );

}


/* =========================================================
   RULES
========================================================= */

async function loadRules() {

    const container =
        document.getElementById(
            "rulesContainer"
        );


    if (!container) {
        return;
    }


    try {

        const data =
            await apiRequest(
                "/rules"
            );


        const rules =
            Array.isArray(data)
                ? data
                : data?.content || [];


        if (!rules.length) {

            return;

        }


        container.innerHTML =
            rules.map(
                createRuleCard
            ).join("");

    }
    catch (error) {

        console.error(
            error
        );

    }

}


function createRuleCard(
    rule
) {

    let icon =
        "bi-sliders";

    let color =
        "purple";


    if (
        rule.ruleType ===
        "HIGH_VALUE_TRANSACTION"
    ) {

        icon =
            "bi-cash-stack";

        color =
            "red";

    }
    else if (
        rule.ruleType ===
        "REFUND_VALIDATION"
    ) {

        icon =
            "bi-arrow-return-left";

        color =
            "purple";

    }
    else if (
        rule.ruleType ===
        "GST_SLAB_VIOLATION"
    ) {

        icon =
            "bi-percent";

        color =
            "orange";

    }


    return `

        <div class="col-xl-4 col-md-6">

            <div class="rule-card">

                <div class="rule-card-top">

                    <div
                        class="rule-icon ${color}">

                        <i
                            class="bi ${icon}">
                        </i>

                    </div>


                    <span
                        class="rule-status ${
                            rule.enabled
                                ? "enabled"
                                : ""
                        }">

                        ${
                            rule.enabled
                                ? "ENABLED"
                                : "DISABLED"
                        }

                    </span>

                </div>


                <h5>

                    ${escapeHtml(
                        rule.ruleName
                    )}

                </h5>


                <p>

                    Configurable compliance
                    validation rule.

                </p>


                <div class="rule-meta">

                    <span>

                        <i
                            class="bi bi-tag">
                        </i>

                        ${escapeHtml(
                            rule.ruleType
                        )}

                    </span>


                    <span>

                        <i
                            class="bi bi-flag">
                        </i>

                        ${escapeHtml(
                            rule.severity
                        )}

                    </span>

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   CREATE RULE
========================================================= */

async function createRule() {

    const configText =
        document.getElementById(
            "ruleConfig"
        ).value;


    let config;


    try {

        config =
            JSON.parse(
                configText || "{}"
            );

    }
    catch (error) {

        showToast(
            "Invalid configuration JSON.",
            "danger"
        );

        return;

    }


    const rule = {

        ruleName:
            document.getElementById(
                "ruleName"
            ).value,

        ruleType:
            document.getElementById(
                "ruleType"
            ).value,

        severity:
            document.getElementById(
                "ruleSeverity"
            ).value,

        config:
            JSON.stringify(
                config
            ),

        enabled:
            document.getElementById(
                "ruleEnabled"
            ).value === "true"

    };


    try {

        await apiRequest(
            "/rules",
            {
                method: "POST",

                body:
                    JSON.stringify(
                        rule
                    )

            }
        );


        showToast(
            "Compliance rule created.",
            "success"
        );


        const modal =
            bootstrap.Modal.getInstance(
                document.getElementById(
                    "ruleModal"
                )
            );


        if (modal) {
            modal.hide();
        }


        loadRules();

    }
    catch (error) {

        showToast(
            error.message,
            "danger"
        );

    }

}


/* =========================================================
   AUDIT LOGS
========================================================= */

async function loadAuditLogs() {

    const body =
        document.getElementById(
            "auditTableBody"
        );


    if (!body) {
        return;
    }


    try {

        const data =
            await apiRequest(
                "/audit-logs"
            );


        const logs =
            Array.isArray(data)
                ? data
                : data?.content || [];


        renderAuditLogs(
            logs
        );

    }
    catch (error) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="text-center text-danger py-5">

                    ${escapeHtml(
                        error.message
                    )}

                </td>

            </tr>

        `;

    }

}


function renderAuditLogs(
    logs
) {

    const body =
        document.getElementById(
            "auditTableBody"
        );


    if (!body) {
        return;
    }


    if (!logs.length) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="text-center py-5">

                    No audit logs found.

                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        logs.map(
            log => `

                <tr>

                    <td>

                        ${formatDate(
                            log.timestamp
                        )}

                    </td>


                    <td>

                        <span
                            class="status-badge enabled">

                            ${escapeHtml(
                                log.eventType
                            )}

                        </span>

                    </td>


                    <td>

                        <strong>

                            ${escapeHtml(
                                log.transactionId ||
                                "-"
                            )}

                        </strong>

                    </td>


                    <td>

                        <code>

                            ${escapeHtml(
                                typeof log.detailJson ===
                                "object"
                                    ? JSON.stringify(
                                        log.detailJson
                                    )
                                    : log.detailJson ||
                                      "-"
                            )}

                        </code>

                    </td>

                </tr>

            `
        ).join("");

}


/* =========================================================
   CHARTS
========================================================= */

function createDashboardCharts() {

    if (
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    const taxCanvas =
        document.getElementById(
            "taxGapChart"
        );


    if (taxCanvas) {

        new Chart(
            taxCanvas,
            {

                type: "line",

                data: {

                    labels: [
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep"
                    ],

                    datasets: [

                        {

                            label:
                                "Expected Tax",

                            data: [
                                180000,
                                220000,
                                205000,
                                270000,
                                310000,
                                295000
                            ],

                            borderColor:
                                "#6366f1",

                            backgroundColor:
                                "rgba(99,102,241,.08)",

                            fill: true,

                            tension: .4

                        },

                        {

                            label:
                                "Reported Tax",

                            data: [
                                175000,
                                210000,
                                201000,
                                245000,
                                280000,
                                260000
                            ],

                            borderColor:
                                "#10b981",

                            backgroundColor:
                                "rgba(16,185,129,.05)",

                            fill: true,

                            tension: .4

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true

                        }

                    }

                }

            }
        );

    }


    const complianceCanvas =
        document.getElementById(
            "complianceChart"
        );


    if (complianceCanvas) {

        new Chart(
            complianceCanvas,
            {

                type: "doughnut",

                data: {

                    labels: [
                        "Compliant",
                        "Underpaid",
                        "Overpaid"
                    ],

                    datasets: [

                        {

                            data: [
                                72,
                                20,
                                8
                            ],

                            backgroundColor: [
                                "#10b981",
                                "#ef4444",
                                "#f59e0b"
                            ],

                            borderWidth:
                                0

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    cutout:
                        "75%",

                    plugins: {

                        legend: {

                            display:
                                false

                        }

                    }

                }

            }
        );

    }

}


/* =========================================================
   HELPERS
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value ?? "";

    }

}


function setStatus(
    id,
    status
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {
        return;
    }


    element.textContent =
        status || "---";


    element.className =
        "status-badge " +
        String(
            status || ""
        )
            .toLowerCase()
            .replace("_", "-");

}


function statusBadge(
    status
) {

    if (!status) {
        return "---";
    }


    const css =
        String(status)
            .toLowerCase()
            .replace("_", "-");


    return `

        <span
            class="status-badge ${css}">

            ${escapeHtml(
                status
            )}

        </span>

    `;

}


function severityBadge(
    severity
) {

    if (!severity) {
        return "---";
    }


    return `

        <span
            class="severity-badge ${
                String(
                    severity
                ).toLowerCase()
            }">

            ${escapeHtml(
                severity
            )}

        </span>

    `;

}


function formatNumber(
    value
) {

    const number =
        Number(
            value || 0
        );


    return number.toLocaleString(
        "en-IN",
        {
            maximumFractionDigits:
                2
        }
    );

}


function formatDate(
    value
) {

    if (!value) {
        return "-";
    }


    try {

        return new Date(
            value
        ).toLocaleString(
            "en-IN",
            {
                dateStyle:
                    "medium",

                timeStyle:
                    "short"
            }
        );

    }
    catch (error) {

        return value;

    }

}


function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    const existing =
        document.getElementById(
            "appToast"
        );


    if (existing) {
        existing.remove();
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.id =
        "appToast";


    toast.style.position =
        "fixed";


    toast.style.right =
        "25px";


    toast.style.bottom =
        "25px";


    toast.style.zIndex =
        "9999";


    toast.className =
        `alert alert-${type} shadow`;


    toast.innerHTML = `

        <div
            class="d-flex align-items-center gap-2">

            <i
                class="bi ${
                    type === "success"
                        ? "bi-check-circle-fill"
                        : "bi-exclamation-circle-fill"
                }">
            </i>

            <span>

                ${escapeHtml(
                    message
                )}

            </span>

        </div>

    `;


    document.body.appendChild(
        toast
    );


    setTimeout(
        () =>
            toast.remove(),
        4000
    );

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            window.location.pathname !==
            "/login"
        ) {

            initializeUser();

        }

    }
);