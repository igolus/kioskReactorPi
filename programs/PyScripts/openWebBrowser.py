import webbrowser

url = 'https://docs.python.org/'



chrome_path = '/usr/lib/chromium-browser/chromium-browser'
webbrowser.get(chrome_path).open(url, 0)

# # Open URL in a new tab, if a browser window is already open.
# webbrowser.open_new_tab(url)
#
# # Open URL in new window, raising the window if possible.
# webbrowser.open_new(url)