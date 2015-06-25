#include <cstdio>
#include <stdio.h>
#include <string.h>
using namespace std;

// Returns a compressed string:
// aaabbbcc ->  a3b3c3
// should be done in constant memory
char * strcmpr(char * str) {

	if (str == NULL) return NULL;
	if (str[0] == '\0') return str;

	int i = 0;
	int nmbrplcmt = 0;
	int accumulator = 0;

	char buffer[10];
	char temp = str[i];
	while (str[i] != '\0') {
		// if the next char doesn't equal to my
		// starting char, a != b
		if (str[i] != temp) {
			str[nmbrplcmt] = str[i - 1];
			// update temp:
			temp = str[i];
			//printf("%d", i);
			// this gets increased so that it
			// can set the value.  i.e.:  a3
			nmbrplcmt++;
			int l = sprintf(buffer, "%d", accumulator);
			strncpy(&str[nmbrplcmt], buffer, l);
			// resets the accumulator for the
			// next letter, in this case, 'b'
			accumulator = 0;
			// numberplacement var gets
			// increased again, so that it is
			// ready to start on the next
			// letter:
			nmbrplcmt++;

		}
		// increase my c-string scroller
		i++;
		// keep counting
		accumulator++;
	}
	str[nmbrplcmt] = str[i - 1];
	nmbrplcmt++;
	int l = sprintf(buffer, "%d", accumulator);
	strncpy(&str[nmbrplcmt], buffer, l);
	str[nmbrplcmt + 1] = '\0';
	return str;
}

int main() {

	char *test = NULL;
	printf("%s", strcmpr(test));

	return 0;
}

