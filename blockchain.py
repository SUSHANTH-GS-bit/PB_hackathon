import hashlib
import json
from datetime import datetime


class Block:

    def __init__(self, index, data, previous_hash):
        self.index = index
        self.timestamp = str(datetime.now())
        self.data = data
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()

    def calculate_hash(self):

        block_string = (
            str(self.index)
            + self.timestamp
            + json.dumps(self.data, sort_keys=True)
            + self.previous_hash
        )

        return hashlib.sha256(
            block_string.encode()
        ).hexdigest()


class Blockchain:

    def __init__(self):
        self.chain = [
            self.create_genesis_block()
        ]

    def create_genesis_block(self):

        return Block(
            0,
            {
                "type": "Genesis Block"
            },
            "0"
        )

    def get_latest_block(self):

        return self.chain[-1]

    def add_block(self, data):

        latest_block = self.get_latest_block()

        new_block = Block(
            len(self.chain),
            data,
            latest_block.hash
        )

        self.chain.append(new_block)

    def is_chain_valid(self):

        for i in range(1, len(self.chain)):

            current_block = self.chain[i]
            previous_block = self.chain[i - 1]

            if current_block.hash != current_block.calculate_hash():
                return False

            if current_block.previous_hash != previous_block.hash:
                return False

        return True