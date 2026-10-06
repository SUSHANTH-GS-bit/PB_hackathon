// ==========================================
// ChainCert Frontend JavaScript
// ==========================================


// Load blockchain when page opens
document.addEventListener("DOMContentLoaded", function () {

    loadBlockchain();

});


// ==========================================
// LOAD BLOCKCHAIN
// ==========================================

async function loadBlockchain() {

    try {

        const response = await fetch("/blockchain");

        const result = await response.json();

        displayBlockchain(result);

    }

    catch (error) {

        console.error("Error loading blockchain:", error);

        document.getElementById("blockchainContainer").innerHTML =
            "<p>Unable to load blockchain.</p>";

    }

}


// ==========================================
// DISPLAY BLOCKCHAIN
// ==========================================

function displayBlockchain(result) {

    const container =
        document.getElementById("blockchainContainer");


    const totalBlocks =
        result.chain.length;


    // Genesis block is not an academic record
    const totalRecords =
        result.chain.length - 1;


    document.getElementById("totalBlocks").textContent =
        totalBlocks;


    document.getElementById("totalRecords").textContent =
        totalRecords;


    // Blockchain status

    const status =
        document.getElementById("status");


    if (result.valid) {

        status.textContent = "🟢 VALID";

        status.style.color = "#4ade80";

    }

    else {

        status.textContent = "🔴 TAMPERED";

        status.style.color = "#ef4444";

    }


    // Clear old blocks

    container.innerHTML = "";


    // Display every block

    result.chain.forEach(function (block) {


        const blockDiv =
            document.createElement("div");


        blockDiv.className = "block";


        let recordHTML = "";


        if (block.data.type === "Genesis Block") {

            recordHTML = `
                <p>
                    <strong>Type:</strong>
                    Genesis Block
                </p>
            `;

        }

        else {

            recordHTML = `

                <p>
                    <strong>Student:</strong>
                    ${block.data.student_name}
                </p>

                <p>
                    <strong>Certificate ID:</strong>
                    ${block.data.certificate_id}
                </p>

                <p>
                    <strong>Course:</strong>
                    ${block.data.course}
                </p>

                <p>
                    <strong>Marks:</strong>
                    ${block.data.marks}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${block.data.date}
                </p>

            `;

        }


        blockDiv.innerHTML = `

            <h3>
                Block #${block.index}
            </h3>

            ${recordHTML}

            <p>
                <strong>Timestamp:</strong>
                ${block.timestamp}
            </p>

            <p>
                <strong>Previous Hash:</strong>
            </p>

            <p class="hash">
                ${block.previous_hash}
            </p>

            <p>
                <strong>Current Hash:</strong>
            </p>

            <p class="hash">
                ${block.hash}
            </p>

        `;


        container.appendChild(blockDiv);

    });

}


// ==========================================
// ADD RECORD
// ==========================================

document
    .getElementById("recordForm")
    .addEventListener("submit", async function (event) {


        event.preventDefault();


        const studentName =
            document.getElementById("studentName").value;


        const certificateId =
            document.getElementById("certificateId").value;


        const course =
            document.getElementById("course").value;


        const marks =
            document.getElementById("marks").value;


        const date =
            document.getElementById("date").value;


        const record = {

            student_name: studentName,

            certificate_id: certificateId,

            course: course,

            marks: marks,

            date: date

        };


        try {


            const response =
                await fetch("/add-record", {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify(record)

                });


            const result =
                await response.json();


            const message =
                document.getElementById("addMessage");


            if (result.success) {


                message.textContent =
                    "✅ " + result.message;


                message.style.color =
                    "#4ade80";


                // Clear form

                document
                    .getElementById("recordForm")
                    .reset();


                // Refresh blockchain

                loadBlockchain();

            }

            else {


                message.textContent =
                    "❌ " + result.message;


                message.style.color =
                    "#ef4444";

            }


        }

        catch (error) {


            console.error(error);


            document.getElementById("addMessage").textContent =
                "❌ Unable to connect to server.";

        }

    });


// ==========================================
// VERIFY CERTIFICATE
// ==========================================

async function verifyCertificate() {


    const certificateId =
        document.getElementById("verifyId").value.trim();


    const resultBox =
        document.getElementById("verificationResult");


    if (!certificateId) {

        resultBox.innerHTML =
            "<p>⚠️ Enter a Certificate ID.</p>";

        return;

    }


    try {


        const response =
            await fetch(
                "/verify/" +
                encodeURIComponent(certificateId)
            );


        const result =
            await response.json();


        if (!result.found) {


            resultBox.innerHTML = `

                <div class="block">

                    <h3>
                        ❌ Certificate Not Found
                    </h3>

                    <p>
                        No record exists for
                        <strong>${certificateId}</strong>.
                    </p>

                </div>

            `;

            return;

        }


        if (result.valid) {


            resultBox.innerHTML = `

                <div class="block">

                    <h3>
                        🟢 Certificate Verified
                    </h3>

                    <p>
                        <strong>Student:</strong>
                        ${result.record.student_name}
                    </p>

                    <p>
                        <strong>Certificate ID:</strong>
                        ${result.record.certificate_id}
                    </p>

                    <p>
                        <strong>Course:</strong>
                        ${result.record.course}
                    </p>

                    <p>
                        <strong>Marks:</strong>
                        ${result.record.marks}
                    </p>

                    <p>
                        <strong>Blockchain Status:</strong>
                        VALID
                    </p>

                </div>

            `;

        }

        else {


            resultBox.innerHTML = `

                <div class="block">

                    <h3>
                        🔴 Tampering Detected
                    </h3>

                    <p>
                        The certificate record exists,
                        but the blockchain integrity has been broken.
                    </p>

                </div>

            `;

        }


    }

    catch (error) {


        console.error(error);


        resultBox.innerHTML =
            "<p>❌ Verification failed.</p>";

    }

}


// ==========================================
// SIMULATE TAMPERING
// ==========================================

async function tamperBlock() {


    const blockIndex =
        document.getElementById("tamperBlock").value;


    const resultBox =
        document.getElementById("tamperResult");


    if (!blockIndex) {

        resultBox.innerHTML =
            "<p>⚠️ Enter a block number.</p>";

        return;

    }


    try {


        const response =
            await fetch(
                "/tamper/" + blockIndex,
                {
                    method: "POST"
                }
            );


        const result =
            await response.json();


        if (result.success) {


            resultBox.innerHTML = `

                <div class="block">

                    <h3>
                        🔴 Tampering Detected
                    </h3>

                    <p>
                        Block #${result.block_index}
                        was modified.
                    </p>

                    <p>
                        Blockchain Status:
                        <strong>
                            INVALID
                        </strong>
                    </p>

                    <p>
                        The block hash no longer matches
                        its original data.
                    </p>

                </div>

            `;


            // Refresh blockchain display

            loadBlockchain();

        }

        else {


            resultBox.innerHTML = `

                <p>
                    ❌ ${result.message}
                </p>

            `;

        }


    }

    catch (error) {


        console.error(error);


        resultBox.innerHTML =
            "<p>❌ Unable to perform tampering test.</p>";

    }

}