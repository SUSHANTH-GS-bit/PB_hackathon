from flask import Flask, render_template, jsonify, request
from blockchain import Blockchain

app = Flask(__name__)

# Create blockchain
blockchain = Blockchain()


# ==========================================
# HOME PAGE
# ==========================================

@app.route("/")
def home():
    return render_template("index.html")


# ==========================================
# GET COMPLETE BLOCKCHAIN
# ==========================================

@app.route("/blockchain", methods=["GET"])
def get_blockchain():

    chain_data = []

    for block in blockchain.chain:

        chain_data.append({
            "index": block.index,
            "timestamp": block.timestamp,
            "data": block.data,
            "previous_hash": block.previous_hash,
            "hash": block.hash
        })

    return jsonify({
        "chain": chain_data,
        "valid": blockchain.is_chain_valid()
    })


# ==========================================
# ADD ACADEMIC RECORD
# ==========================================

@app.route("/add-record", methods=["POST"])
def add_record():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400

    student_name = str(
        data.get("student_name", "")
    ).strip()

    certificate_id = str(
        data.get("certificate_id", "")
    ).strip()

    course = str(
        data.get("course", "")
    ).strip()

    marks = data.get("marks")

    date = str(
        data.get("date", "")
    ).strip()


    # Check required fields

    if not student_name:
        return jsonify({
            "success": False,
            "message": "Student name is required"
        }), 400


    if not certificate_id:
        return jsonify({
            "success": False,
            "message": "Certificate ID is required"
        }), 400


    if not course:
        return jsonify({
            "success": False,
            "message": "Course is required"
        }), 400


    if marks is None or marks == "":
        return jsonify({
            "success": False,
            "message": "Marks are required"
        }), 400


    # Prevent duplicate certificate IDs

    new_id = certificate_id.lower()

    for block in blockchain.chain:

        existing_id = block.data.get("certificate_id")

        if existing_id:

            if str(existing_id).strip().lower() == new_id:

                return jsonify({
                    "success": False,
                    "message": "Certificate ID already exists"
                }), 400


    # Create academic record

    record = {

        "type": "Academic Record",

        "student_name": student_name,

        "certificate_id": certificate_id,

        "course": course,

        "marks": marks,

        "date": date

    }


    # Add record to blockchain

    blockchain.add_block(record)


    latest_block = blockchain.get_latest_block()


    return jsonify({

        "success": True,

        "message": "Academic record added successfully",

        "block": {

            "index": latest_block.index,

            "hash": latest_block.hash

        }

    })


# ==========================================
# VERIFY CERTIFICATE
# ==========================================

@app.route("/verify/<certificate_id>", methods=["GET"])
def verify_certificate(certificate_id):

    # Remove spaces and make lowercase
    search_id = str(
        certificate_id
    ).strip().lower()


    for block in blockchain.chain:

        stored_id = block.data.get(
            "certificate_id"
        )


        if stored_id is not None:

            stored_id = str(
                stored_id
            ).strip().lower()


            # Case-insensitive comparison

            if stored_id == search_id:

                blockchain_valid = (
                    blockchain.is_chain_valid()
                )


                return jsonify({

                    "found": True,

                    "valid": blockchain_valid,

                    "record": block.data,

                    "block_index": block.index,

                    "hash": block.hash

                })


    # Certificate not found

    return jsonify({

        "found": False,

        "valid": False,

        "message": "Certificate not found"

    })


# ==========================================
# CHECK BLOCKCHAIN INTEGRITY
# ==========================================

@app.route("/validate", methods=["GET"])
def validate_blockchain():

    valid = blockchain.is_chain_valid()


    if valid:

        message = (
            "Blockchain is valid. "
            "No tampering detected."
        )

    else:

        message = (
            "Tampering detected! "
            "Blockchain integrity is broken."
        )


    return jsonify({

        "valid": valid,

        "message": message

    })


# ==========================================
# TAMPER DEMONSTRATION
# ==========================================

@app.route("/tamper/<int:block_index>", methods=["POST"])
def tamper_block(block_index):

    # Genesis block cannot be tampered
    if block_index <= 0:

        return jsonify({

            "success": False,

            "message": (
                "Genesis Block cannot be tampered."
            )

        }), 400


    # Check block exists

    if block_index >= len(blockchain.chain):

        return jsonify({

            "success": False,

            "message": "Invalid block number."

        }), 400


    block = blockchain.chain[block_index]


    # Modify the record

    if "marks" in block.data:

        block.data["marks"] = "TAMPERED"


    elif "student_name" in block.data:

        block.data["student_name"] = "TAMPERED"


    else:

        block.data["tampered"] = True


    # IMPORTANT:
    # We do NOT recalculate the hash.
    # This allows the blockchain to detect
    # that the data was modified.

    blockchain_valid = (
        blockchain.is_chain_valid()
    )


    return jsonify({

        "success": True,

        "message": (
            "Block data has been modified. "
            "Blockchain integrity check completed."
        ),

        "block_index": block_index,

        "blockchain_valid": blockchain_valid

    })


# ==========================================
# START FLASK SERVER
# ==========================================

if __name__ == "__main__":

    app.run(debug=True)