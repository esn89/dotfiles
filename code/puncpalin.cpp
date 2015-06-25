#include <iostream>
#include <ctype.h>

using namespace std;

bool ispunc(char* s) {
	if ( (s[0] >= 'A' && s[0] <= 'Z') || (s[0] >= 'a' && s[0] <= 'z')) {
		return false;
	}
	else {
		return true;
	}
}


bool palin(char* s) {

	int i = 0;
	while (s[i] != '\0') {
		i++;
	}
	int max = i - 1;
	int start = 0;

	while (max >= start) {
		if ( (ispunc(&s[max]) == true) && (ispunc(&s[start]) == true)) {
			max--;
			start++;
		} else if (ispunc(&s[max]) == true) {
			max--;
		} else if (ispunc(&s[start]) == true) {
			start++;
		} else {
			// both are not punctuation, let's
			// check if they are equal:
			cout << s[max] << " " << s[start] << endl;
			// okay so, A and a, B and b will
			// fail it:
			if (tolower(s[max]) != tolower(s[start])) return false;
			else {
				max--;
				start++;
			}
		}
	}
	cout << max << " " << start << endl;
	return true;
}

int main() {

	char test[] = "A man, a plan, a canal, Panama!";
	if (palin(test) == true) {
		cout << "palin" << endl;
	} else cout << "not" << endl;
	return 0;
}
