---
to: tap-<%=name%>/README.md
---
# tap-<%=name%>

Author: John Young (@johnatspreadstreet)

This is a [Singer](http://singer.io) tap that produces JSON-formatted data following the [Singer spec](https://github.com/singer-io/getting-started/blob/master/SPEC.md).

It:
- Generates a catalog of available data in <%=Name%>

### Quick Start

1. Install

```
npm i -g tap-<%=name%>
```

3. Create the config file.

There is a template you can use at config.json.example, just copy it to config.json in the repo root

4. Run the application to generate a catalog.

```
tap-<%=name%> --config config.json --discover > catalog.json
```

5. Select the tables to replicate

Step 4 generates a a file called `catalog.json` that specifies all the available endpoints and fields. You'll need to open the file and select the ones you'd like to replicate. See the [Singer guide on Catalog Format](https://github.com/singer-io/getting-started/blob/c3de2a10e10164689ddd6f24fee7289184682c1f/BEST_PRACTICES.md#catalog-format) for more information on how tables are selected.

6. Run it!

```bash
tap-<%=name%> --config config.json --catalog catalog.json
```

Immense shoutout to [Fishtown Analytics](https://www.fishtownanalytics.com/) for all the help, guidance, and knowledge.