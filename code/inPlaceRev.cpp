#include <iostream>

using namespace std;

char* revStringip(char* s) {

	int max = 0;
	while (s[max] != '\0') {
		max++;
	}
	// max should be 4
	for (int i = max - 1; i >= (max / 2); i--) {
		s[max] = s[i];
		s[i] = s[max - i - 1 ];
		s[max - i - 1] = s[max];
	}
	s[max] = '\0';
	return s;
}


int main() {

	char test[] = "asdfg";
	cout << revStringip(test) << endl;
	return 0;
}
