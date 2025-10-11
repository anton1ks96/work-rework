package main

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

type User struct {
	ID         string `json:"id"`
	LastName   string `json:"last_name"`
	FirstName  string `json:"first_name"`
	AvatarPath string `json:"avatar_path"`
	URL        string `json:"url"`
	Group      string `json:"group"`
}

type htmlEntry struct {
	ID        string
	LastName  string
	FirstName string
	Group     string
}

func main() {
	repoPath := `C:\Users\PC\Desktop\work.students.it-college.ru\repo`
	photosPath := `C:\Users\PC\Desktop\work.students.it-college.ru\photos`
	studentsHTMLPath := `C:\Users\PC\Desktop\work.students.it-college.ru\students.htm`

	photosPrefix := "work.students.it-college.ru/photos"
	repoPrefix := "work.students.it-college.ru/repo"

	repoIDs, err := collectRepoIDs(repoPath)
	if err != nil {
		log.Fatalf("Ошибка при сборе ID из %s: %v", repoPath, err)
	}

	photoMap, err := collectPhotoMap(photosPath, photosPrefix)
	if err != nil {
		log.Fatalf("Ошибка при сборе фотографий из %s: %v", photosPath, err)
	}

	htmlDataMap, err := parseStudentsHTML(studentsHTMLPath)
	if err != nil {
		log.Fatalf("Ошибка при парсинге HTML %s: %v", studentsHTMLPath, err)
	}

	var users []User
	for _, userID := range repoIDs {
		avatarPath := ""
		if pathFromMap, ok := photoMap[userID]; ok {
			avatarPath = pathFromMap
		}

		urlPath := filepath.Join(repoPrefix, userID)
		urlPath = filepath.ToSlash(urlPath)

		user := User{
			ID:         userID,
			FirstName:  "",
			LastName:   "",
			AvatarPath: avatarPath,
			URL:        urlPath,
			Group:      "",
		}

		if info, ok := htmlDataMap[userID]; ok {
			user.FirstName = info.FirstName
			user.LastName = info.LastName
			user.Group = info.Group
		}

		users = append(users, user)
	}

	err = saveJSONToFile("datas.json", users)
	if err != nil {
		log.Fatalf("Ошибка при сохранении JSON в файл: %v", err)
	}

	fmt.Println("Файл result.json успешно создан (UTF-8 с BOM).")
}

func collectRepoIDs(repoPath string) ([]string, error) {
	entries, err := ioutil.ReadDir(repoPath)
	if err != nil {
		return nil, err
	}

	var ids []string
	for _, entry := range entries {
		if entry.IsDir() {
			name := entry.Name()
			ids = append(ids, name)
		}
	}
	return ids, nil
}

func collectPhotoMap(photosPath, photosPrefix string) (map[string]string, error) {
	photoMap := make(map[string]string)

	err := filepath.Walk(photosPath, func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}

		filename := info.Name()
		ext := filepath.Ext(filename)
		base := strings.TrimSuffix(filename, ext)

		userID := parsePhotoName(base)
		if userID != "" {
			relativePath := filepath.Join(photosPrefix, filename)
			relativePath = filepath.ToSlash(relativePath)
			photoMap[userID] = relativePath
		}
		return nil
	})

	return photoMap, err
}

func parsePhotoName(name string) string {
	if len(name) < 5 || !strings.HasPrefix(name, "20") {
		return ""
	}
	remainder := name[2:]

	if len(remainder) < 2 {
		return ""
	}
	group := remainder[:2]
	userNum := remainder[2:]

	if len(userNum) < 4 {
		userNum = fmt.Sprintf("%04s", userNum)
	}

	return fmt.Sprintf("i%ss%s", group, userNum)
}

func parseStudentsHTML(htmlFile string) (map[string]htmlEntry, error) {
	data, err := ioutil.ReadFile(htmlFile)
	if err != nil {
		return nil, err
	}

	lines := strings.Split(string(data), "\n")

	reGroup := regexp.MustCompile(`<!--\s*([0-9]+-[0-9]+)\s*-->`)

	reAnchor := regexp.MustCompile(`(?s)<a\s+href="repo/(i[^"]+)"[^>]*data-title="<strong>([^<]+)`)

	result := make(map[string]htmlEntry)

	currentGroup := ""

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		if groupMatches := reGroup.FindStringSubmatch(line); groupMatches != nil {
			currentGroup = strings.TrimSpace(groupMatches[1])
			continue
		}

		if anchorMatches := reAnchor.FindStringSubmatch(line); anchorMatches != nil {
			userID := strings.TrimSpace(anchorMatches[1])
			fullName := strings.TrimSpace(anchorMatches[2])

			fnParts := strings.Fields(fullName)
			var lastName, firstName string
			if len(fnParts) >= 2 {
				lastName = fnParts[0]
				firstName = strings.TrimSuffix(fnParts[1], ".")
			} else {
				lastName = fullName
				firstName = ""
			}

			result[userID] = htmlEntry{
				ID:        userID,
				LastName:  lastName,
				FirstName: firstName,
				Group:     currentGroup,
			}
		}
	}

	return result, nil
}

func saveJSONToFile(filename string, data interface{}) error {
	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}

	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.Write([]byte{0xEF, 0xBB, 0xBF})
	if err != nil {
		return err
	}

	_, err = file.Write(jsonData)
	if err != nil {
		return err
	}

	return nil
}
