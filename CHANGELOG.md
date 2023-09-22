# StreamerSongList Userscript Change Log

Changes to the script over time will be logged here.

# Version 1.0.3

### Released 2023-09-21

- Bumped the number of highlighters from 5 to 10

# Version 1.0.1

### Released 2023-09-07

- Removed superfluous console log messages

# Version 1.0.0

### Released 2023-09-07

- Added a bump color table that can be used to customized which rows are highlighted and which colors are used

# Version 0.2.3

### Released 2023-09-05

- Fixed single quotes breaking "move to top of queue" feature.
- Fixed Bump counter being duplicated
- Added multiple colors for different types of bumps

# Version 0.2.2

### Released 2023-08-27

- Added color coding to bumped songs

# Version 0.2.1

### Released 2023-08-27

- Updated the artist and title to be URL encoded to prevent problems with special characters

# Version 0.2.0 

### Released 2023-08-24

- Added a localStorage item `streamerData` to hold StreamerSongList data about a Streamer
- - `streamerData` is refreshed on page load
- Updated "Move to Top" buttons on the queue page to use the StreamerSongList API to change the queue order
- - The button previously had manipulated the elements on the page to accomplish this.
- Added this Change Log

# Version 0.1.0

### Released 2023-08-23

Initial Version