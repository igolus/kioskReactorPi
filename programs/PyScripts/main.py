# This is a sample Python script.

# Press Shift+F10 to execute it or replace it with your code.
# Press Double Shift to search everywhere for classes, files, tool windows, actions, and settings.
import commod
import asyncio
import json

# code = input("Type code: ")
# print("code :" + code);

with open('../config.json') as f:
    config = json.load(f);

async def main():
    await commod.triggerQrCode("3119780268696")

asyncio.run(main())
# asyncio.run(main())

# print (config["urlPostEvent"])
# def print_hi(name):
#     # Use a breakpoint in the code line below to debug your script.
#     print(f'Hi, {name}')  # Press Ctrl+F8 to toggle the breakpoint.


# Press the green button in the gutter to run the script.
# if __name__ == '__main__':
#     print_hi('PyCharm')

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
