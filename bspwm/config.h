/* The height of the bar (in pixels) */
#define BAR_HEIGHT  18
/* The width of the bar. Set to -1 to fit screen */
#define BAR_WIDTH   1254
/* Offset from the left. Set to 0 to have no effect */
#define BAR_OFFSET (1280 - 1254) / 2
/* Choose between an underline or an overline */
#define BAR_UNDERLINE 1
/* The thickness of the underline (in pixels). Set to 0 to disable. */
#define BAR_UNDERLINE_HEIGHT 2
/* Default bar position, overwritten by '-b' switch */
#define BAR_BOTTOM 0
/* The fonts used for the bar, comma separated. Only the first 2 will be used. */
#define BAR_FONT       "-*-terminus-medium-r-normal-*-12-*-*-*-c-*-*-1","fixed"
/* Some fonts don't set the right width for some chars, pheex it */
#define BAR_FONT_FALLBACK_WIDTH 6
/* Define the opacity of the bar (requires a compositor such as compton) */
#define BAR_OPACITY 1.0 /* 0 is invisible, 1 is opaque */
/* Color palette */
//#define BACKGROUND 0x232c31
#define BACKGROUND 0x303030
#define COLOR0 0x2D3C46
#define COLOR1 0xAC4142         //red
#define COLOR2 0xF4BF75         //yellow
#define COLOR3 0xD28445         //orange
#define COLOR4 0x6A9FB5         //light blue
#define COLOR5 0xAA759F         //magenta
#define COLOR6 0x75B5AA         //teal
#define COLOR7 0x6C7A80         //light grey
#define COLOR8 0x303030         //darker grey
#define COLOR9 0x99CC99         //green
#define FOREGROUND 0xc5c8c6
